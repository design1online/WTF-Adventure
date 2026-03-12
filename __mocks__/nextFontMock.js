// Mock for next/font/* — returns a font object with a className string
module.exports = new Proxy(
  {},
  {
    get(_, fontName) {
      return () => ({ className: fontName.toLowerCase(), style: { fontFamily: fontName } });
    },
  }
);
