import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Comment from './Comment.jsx';

class CommentList extends Component {
  constructor(props) {
    super(props);
    this.state = {open: this.props.defaultOpen};
  }

  toggleOpen = () => {
    const {open} = this.state;
    this.setState({open: !open});
  };

  render() {
    const {open} = this.state;
    const {title, items, note, content, ...other} = this.props;
    if (items.length == 0 && !content) return null;

    let expander = open ? '−' : '+';
    return (
      <div className="comments-list alert">
        <span
          className={`list-title ${note ? 'list-title-note' : ''}`}
          onClick={this.toggleOpen}>
          {title}
          <span className="pull-right danger">{expander}</span>
        </span>
        {open && content}
        {open &&
          items.map((item, i) => (
            <Comment
              key={i}
              {...item}
              {...other}
              last={i + 1 == items.length}
            />
          ))}
      </div>
    );
  }
}

CommentList.propTypes = {
  title: PropTypes.string,
  items: PropTypes.array,
};

CommentList.defaultProps = {
  defaultOpen: true,
  title: 'link',
  items: [],
};

export default CommentList;
