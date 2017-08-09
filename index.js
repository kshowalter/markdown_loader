/**
 * .
 * @exports
 */
module.exports = function(markdown_text){
  var lines = markdown_text.split('\n');
  var specs = [];

  var re_indent = /^[ ]+/;
  //var re_special = /^\#+|^\*|^\-{3}/;
  var re_special = /^\#+|^ *\*|^ *[0-9]|^\-{3}/;

  var lastIndent = 0;

  var paragraph = '';

  var level = 0;
  var parent = [
    specs
  ];

  lines.forEach(function(line, i){
    var indent;
    if( line.match(re_indent) ){
      indent = Math.floor(line.match(re_indent)[0].length/2);
    } else {
      indent = 0;
    }
    line = line.trim();
    var special_match = line.match(re_special);

    var spec = {
      tag: false,
      text: false
    };

    if( line === '' || special_match ){ // blank line or speial character
      // Complete paragraph
      if( paragraph ){
        spec.tag = 'p';
        spec.text = paragraph;
        paragraph = '';
        parent[level].push(spec);
      }
    }

    if( special_match ) { // special
      parent[level].push(spec);

      var clean_text = line.slice(special_match[0].length).trim();

      if( line[0] === '#' ){ //heading
        var new_hlevel = line.match(/^#+[^#]/)[0].length - 1;

        if( new_hlevel > level ){
          level = new_hlevel;
          spec.tag = 'div';
          spec.text = undefined;
          spec.props = {
            class: 'level_'+new_hlevel
          };
          spec.children = [
            {
              tag: 'h'+new_hlevel,
              text: clean_text
            }
          ];
          parent[level] = spec.children;
        } else if( new_hlevel < level ){
          level = new_hlevel;


        } else {
          spec.tag = 'h'+new_hlevel;
          spec.text = clean_text;
        }
      } else if( line[0] === '*' ){
        spec.tag = 'ul';
        spec.text = clean_text;
      } else if( line.match(/^[0-9]/) ){
        spec.tag = 'ol';
        spec.text = clean_text;
      } else if( line.match(/^-{3}/) ){
        spec.tag = 'hr';
        spec.text = clean_text;
      }

    } else { // paragraph
      paragraph += line;
    }

  });


  console.log( 'module.exports = ' + JSON.stringify(specs) );
  return 'module.exports = ' + JSON.stringify(specs);
};
