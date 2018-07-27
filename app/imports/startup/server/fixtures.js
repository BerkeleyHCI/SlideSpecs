import {Meteor} from 'meteor/meteor';
import {Lists} from '../../api/lists/lists.js';
import {Todos} from '../../api/todos/todos.js';
import {Files} from '../../api/files/files.js';

// if the database is empty on server start, create some sample data.
// TODO write this data with your slide information.
// Sketching out the database structure for application.

Meteor.startup(() => {
  if (Lists.find().count() === 0) {
    const data = [
      {
        name: 'Favorite Scientists',
        items: [
          'Ada Lovelace',
          'Grace Hopper',
          'Marie Curie',
          'Carl Friedrich Gauss',
          'Nikola Tesla',
          'Claude Shannon',
        ],
      },
    ];

    let timestamp = new Date().getTime();
    data.forEach(list => {
      const listId = Lists.insert({
        name: list.name,
        incompleteCount: list.items.length,
      });

      list.items.forEach(text => {
        Todos.insert({
          listId,
          text,
          createdAt: new Date(timestamp),
        });

        timestamp += 1; // ensure unique timestamp.
      });
    });
  }
});
