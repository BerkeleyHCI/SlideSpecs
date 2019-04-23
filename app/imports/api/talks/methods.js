import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Random} from 'meteor/random';
import _ from 'lodash';

import {Talks} from './talks.js';
import {Comments} from '../comments/comments.js';
import {Events} from '../events/events.js';
import {Files} from '../files/files.js';
import {Sounds} from '../sounds/sounds.js';
import {Images} from '../images/images.js';
import {logEvent} from '../events/methods.js';

export const createTalk = new ValidatedMethod({
  name: 'talks.create',
  validate: new SimpleSchema({}).validator(),
  run({name}) {
    if (!this.userId) {
      throw new Meteor.Error(
        'api.sessions.create.accessDenied',
        'You must log in to create a session.',
      );
    }

    if (!name) {
      const iter = new Date().toLocaleDateString();
      name = `talk ${iter}`;
    }

    const talkId = Talks.insert({
      userId: this.userId,
      created: Date.now(),
      secret: Random.id(),
      name,
    });

    // set default tags
    //Comments.insert({
    //talk: talkId,
    //created: Date.now(),
    //author: 'SlideSpecs',
    //content: '#great #story #clarity #slideDesign',
    //});

    return talkId;
  },
});

export const renameTalk = new ValidatedMethod({
  name: 'talks.rename',
  validate: new SimpleSchema({
    talkId: {type: String},
    newName: {type: String},
  }).validator(),
  run({talkId, newName}) {
    const talk = Talks.findOne(talkId);
    if (!talk) {
      throw new Meteor.Error(
        'api.talks.delete.talkNotFound',
        'This talk does not exist.',
      );
    }

    // Talk owner should be able to edit/delete talk
    if (talk.userId === this.userId) {
      return Talks.update(talkId, {$set: {name: newName}});
    } else {
      throw new Meteor.Error(
        'api.talks.rename.accessDenied',
        "You don't have permission to edit this talk.",
      );
      return false;
    }
  },
});

// For uploading status.
export const setTalkProgress = new ValidatedMethod({
  name: 'talks.setProgress',
  validate: new SimpleSchema({
    talkId: {type: String},
    progress: {type: Number},
  }).validator(),
  run({talkId, progress}) {
    const talk = Talks.findOne(talkId);
    if (!talk) {
      throw new Meteor.Error(
        'api.talks.delete.talkNotFound',
        'This talk does not exist.',
      );
    }

    // Talk owner should be able to edit/delete talk
    if (talk.userId === this.userId) {
      return Talks.update(talkId, {$set: {progress: progress}});
    } else {
      throw new Meteor.Error(
        'api.talks.rename.accessDenied',
        "You don't have permission to edit this talk.",
      );
    }
  },
});

export const setRespondingComment = new ValidatedMethod({
  name: 'talks.setRespondingComment',
  validate: new SimpleSchema({
    talkId: {type: String},
    commentId: {type: String},
  }).validator(),
  run({talkId, commentId}) {
    const talk = Talks.findOne(talkId);
    const comment = Comments.findOne(commentId);
    if (!comment || !talk) {
      throw new Meteor.Error('api.talks', 'Talk/comment not found.');
      console.error(comment, talk, commentId, talkId);
      return false;
    }

    let data;
    if (!talk.active) {
      data = [];
    } else if (
      typeof talk.active === 'string' ||
      talk.active instanceof String
    ) {
      data = [talk.active];
    } else {
      data = talk.active;
    }

    let newActive, string;
    const base = {
      talk: talkId,
      comment: commentId,
      type: 'setRespondingComment',
    };

    const activeIdx = data.indexOf(commentId);
    if (activeIdx >= 0) {
      // Comment no longer being discussed.
      string = JSON.stringify({responding: false});
      logEvent.call({data: string, ...base});
      data.splice(activeIdx, 1);
      newActive = data;
    } else {
      // Comment is now being discussed.
      string = JSON.stringify({responding: true});
      logEvent.call({data: string, ...base});
      newActive = data.concat([commentId]);
    }

    Talks.update(talkId, {$set: {active: newActive}});
  },
});

// Testing method to see when a comment has been discussed.
export const generateWordFreq = new ValidatedMethod({
  name: 'talk.generateWordFreq',
  validate: new SimpleSchema({
    talkId: {type: SimpleSchema.RegEx.Id},
  }).validator(),
  run({talkId}) {
    console.log(`generating hint words for talk: ${talkId}`);
    const talk = Talks.findOne(talkId);
    if (!talk) throw 'talk not found';

    const fillerWords = [
      'like',
      'actually',
      'the',
      'as',
      'the',
      'yes',
      'no',
      'agree',
    ];

    const punctuation = /[.,\/#!$%\^&\*;:{}=\-_`~()]/g;

    const commentWords = Comments.find({talk: talkId})
      .fetch()
      .map(c => c.content.trim())
      .join('\n')
      .split(/\s/)
      .map(c => c.replace(punctuation, ''))
      .map(c => c.trim())
      .filter(c => !fillerWords.includes(c));
    const wordFreq = _.countBy(commentWords);
    const wordArray = Object.keys(wordFreq)
      .map(key => {
        return {
          word: key,
          count: wordFreq[key],
        };
      })
      .slice(0, 500); // google cloud limit

    const sortArray = _.orderBy(wordArray, ['count'], ['desc']);
    return sortArray;
  },
});

export const generateCommentRegions = new ValidatedMethod({
  name: 'talk.generateCommentRegions',
  validate: new SimpleSchema({
    talkId: {type: SimpleSchema.RegEx.Id},
    callback: {type: Function, optional: true},
  }).validator(),
  run({talkId, callback}) {
    console.log(`generating regions for talk: ${talkId}`);
    if (!callback) callback = console.log;
    const talk = Talks.findOne(talkId);
    if (!talk) throw 'talk not found';

    const convertData = c => {
      if (c.data) {
        const data = JSON.parse(c.data); // deserialize event data.
        delete c.data;
        return {...c, ...data};
      } else {
        return c;
      }
    };

    // TODO filter out regions that are beyond the end of the audio recording.

    const commentToRegions = c => {
      let events = Events.find({comment: c._id}, {sort: {created: 1}})
        .fetch()
        .map(convertData)
        .filter(e => e && e.type && e.type === 'setRespondingComment');

      //make sure first event is turning on responding.
      while (events[0] && events[0].responding !== true) {
        console.log('cleaning events in generator:', events);
        events.shift(); // remove element
      }

      // TODO - set start to first audio recording click.

      // group by two, only accept pairs
      const audioOffset = 60 * 1000; // length of clip (1 minute)
      const audioStart = talk.audioStart - audioOffset;
      const paired = _.chunk(events, 2).filter(x => x.length === 2);
      const regions = paired.map(pair => {
        return {
          commentId: c._id,
          startTime: pair[0].created - audioStart,
          stopTime: pair[1].created - audioStart,
        };
      });

      return regions;
    };

    const updateRegions = regions => {
      if (regions[0]) {
        const cleanRegions = regions.map(({startTime, stopTime}) => {
          return {startTime, stopTime};
        });
        return Comments.update(regions[0].commentId, {
          $set: {regions: cleanRegions},
        });
      }
    };

    const comments = Comments.find({talk: talkId})
      .fetch()
      .map(commentToRegions)
      .map(updateRegions);
  },
});

export const setAudioStart = new ValidatedMethod({
  name: 'talk.setAudioStart',
  validate: new SimpleSchema({
    talkId: {type: String},
  }).validator(),
  run({talkId}) {
    const talk = Talks.findOne(talkId);
    if (!talk) return false; // talk does not exist
    const [oldest] = Sounds.find(
      {'meta.talkId': talkId},
      {sort: {'meta.created': 1}, limit: 1},
    ).fetch();
    if (!oldest) return false; // sound does not exist
    //console.log(oldest);
    Talks.update(talkId, {$set: {audioStart: oldest.meta.created}});
  },
});

export const checkUserTalk = new ValidatedMethod({
  name: 'talk.checkUser',
  validate: new SimpleSchema({
    matchId: {type: String},
  }).validator(),
  run({matchId}) {
    const talk = Talks.findOne(matchId);
    if (!talk) {
      return false; // talk does not exist
    } else if (talk.userId === this.userId) {
      return true; // user owns talk
    }
  },
});

export const deleteTalk = new ValidatedMethod({
  name: 'talks.delete',
  validate: new SimpleSchema({
    talkId: {type: String},
  }).validator(),
  run({talkId}) {
    const talk = Talks.findOne(talkId);
    if (!talk) {
      throw new Meteor.Error(
        'api.talks.delete.talkNotFound',
        'This talk does not exist.',
      );
    }

    // Talk owner or session owner should be able to edit/delete talk
    if (talk.userId === this.userId) {
      try {
        // deleting related files
        Files.remove({'meta.talkId': talkId});
        Images.remove({'meta.talkId': talkId});
        Comments.remove({talk: talkId});
        return Talks.remove(talkId);
      } catch (e) {
        console.error(e);
      }
    } else {
      throw new Meteor.Error(
        'api.talks.delete.accessDenied',
        "You don't have permission to delete this talk.",
      );
    }
  },
});
