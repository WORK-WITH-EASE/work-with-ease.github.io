export default function (config) {
  config.addPassthroughCopy({ 'src/static': '.' });
  return { dir: { input: 'src', includes: '_includes', data: '_data' }, templateFormats: ['njk'], htmlTemplateEngine: 'njk' };
}
