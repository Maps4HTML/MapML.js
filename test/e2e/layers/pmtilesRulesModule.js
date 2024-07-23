const pmtilesRules = new Map();
pmtilesRules.set('http://localhost:30001/spearfish.pmtiles?theme=dark', {
  theme: { theme: 'dark' }
});
pmtilesRules.set(
  'http://localhost:30001/tiles/osmtile/{beans}/{foo}/{bar}.mvt?theme=light',
  { theme: { theme: 'light' } }
);
pmtilesRules.set(
  'http://localhost:30001/tiles/osmtile/{z}/{x}/{y}.mvt?theme=light',
  { theme: { theme: 'light' } }
);
export { pmtilesRules };
