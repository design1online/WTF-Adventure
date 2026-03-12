const React = require('react');

const MockNextImage = (props) => {
  return React.createElement('img', Object.assign({}, props, { src: props.src || '' }));
};

module.exports = {
  __esModule: true,
  default: MockNextImage,
};
