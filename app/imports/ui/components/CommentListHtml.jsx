import React, {Component} from 'react';
import PropTypes from 'prop-types';
import CommentHtml from './CommentHtml.jsx';

class CommentListHtml extends Component {
  constructor(props) {
    super(props);
    this.state = {open: true};
  }

  toggleOpen = () => {
    const {open} = this.state;
    this.setState({open: !open});
  };

  render() {
    const {open} = this.state;
    const {title, items, note, ...other} = this.props;
    if (items.length == 0) return null;

    let expander = open ? '−' : '+';
    return (
      <div className="comments-list alert">
        <span
          className={`list-title ${note ? 'list-title-note' : ''}`}
          onClick={this.toggleOpen}>
          {title}
          <span className="pull-right danger">{expander}</span>
        </span>
        {open &&
          items.map((item, i) => (
            <CommentHtml
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

CommentListHtml.propTypes = {
  title: PropTypes.string,
  items: PropTypes.array,
};

CommentListHtml.defaultProps = {
  title: 'link',
  items: [],
};

export default CommentListHtml;
