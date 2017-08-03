

/**
 * .
 * @exports
 */
module.exports = function(markdown_text){
  var children = [];

  var lines = markdown_text.split('/n');

  console.log(lines[0]);

  var regexIndent = /^\s+/;
  var regexMark = /^\#+|^\*|^\-{3}/;

  var lastIndent = 0;

  lines.forEach(function(line){
    var indent = line.match(regexIndent);
    line = line.trim();

    var mark = line.match(regexMark);

    var lineText;
    if( mark ){
      lineText = line.slice(regexMark.length).trim();
    } else {
      lineText = line;
    }

    if( mark[0] === '#' ){ //heading
      var hlevel = line.match(/^#./)[0].length;
      children.push({
        tag: 'h'+hlevel,
        text: line
      });
    } else if( mark === '*' ){
      
    }



  });

  return false;
};
