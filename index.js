/**
 * .
 * @exports
 */
module.exports = function(markdown_text){
  var lines = markdown_text.split('/n');
  var specs = [];

  var re_indent = /^[ ]+/;
  //var re_special = /^\#+|^\*|^\-{3}/;
  var re_special = /^\#+|^ *\*|^ *[0-9]|^\-{3}/;

  var lastIndent = 0;

  var paragraph = '';

  lines.forEach(function(line){
    var indent;
    if( line.match(re_indent) ){
      indent = Math.floor(line.match(re_indent)[0].length/2);
    } else {
      indent = 0;
    }
    line = line.trim();
    var special_match = line.match(re_special);

    var line_text;
    var type;

    if( line === '' ){ // blank line
      // Complete paragraph
      specs.push({
        tag: 'p',
        text: paragraph
      });
      paragraph = '';
    } else if( special_match ) { // special
      if( paragraph ){
        // Complete paragraph
        specs.push({
          tag: 'p',
          text: paragraph
        });
        paragraph = '';
      }

      line_text = line.slice(re_special.length).trim();

      if( line[0] === '#' ){ //heading
        var hlevel = line.match(/^#+[^#]/)[0].length - 1;
        type = 'h'+hlevel;
      } else if( line[0] === '*' ){
        type = 'ul';
      } else if( line.match(/^[0-9]/) ){
        type = 'ol';
      } else if( line.match(/^-{3}/) ){
        type = 'hr';
      }

      specs.push({
        tag: type,
        text: line_text
      });

    } else { // paragraph
      paragraph += line;
    }

  });


  console.log('SPECS', JSON.stringify(specs));
  return JSON.stringify(specs);
};
