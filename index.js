var process_text = require('./process_text');

/**
 * .
 * @exports
 */
module.exports = function(markdown_text){
  var lines = markdown_text.split('\n');

  var re_indent = /^[ ]+/;
  //var re_special = /^\#+|^\*|^\-{3}/;
  var re_special = /^#+|^ *\*|^ *\+|^ *-|^ *[0-9]|^-{3}/;

  var paragraph_children = [];

  var specs = {
    tag: 'div',
    props: {
      class: 'level_0'
    },
    children: [],
  };

  var h_level = 0;
  var h_parent = [
    specs.children
  ];

  var root_ul = false;
  var lastIndent = 0;
  var l_level = 0;
  var l_parent = [];

  lines.forEach(function(line, i){
    var indent;
    if( line.match(re_indent) ){
      indent = Math.floor(line.match(re_indent)[0].length/2);
    } else {
      indent = 0;
    }
    var special_match = line.match(re_special);

    var line_trimed = line.trim();



    if( line_trimed === '' ){ // blank line or speial character
      // list level reset and commit list to structure
      l_level = 0;
      lastIndent = 0;
      if( root_ul ){
        console.log(root_ul);
        h_parent[h_level].push(root_ul);
        root_ul = false;
        l_parent = [];
      }
    //} else if( ! special_match ) {
    //  line = line.trim() + ' ';
    } else {
      //line = line.trim();
      //line = line.trim() + ' ';
    }

    if( line_trimed === '' || special_match ){ // blank line or speial character
      // Complete paragraph
      if( paragraph_children[0] ){
        h_parent[h_level].push({
          tag: 'p',
          children: paragraph_children,
        });
        paragraph_children = [];
      }
    }




    if( ! special_match ) { // paragraph line
      paragraph_children = paragraph_children.concat(process_text(line));
    } else { // special
      var clean_text = line.slice(special_match[0].length).trim();

      if( line_trimed[0] === '#' ){ // new heading

        var new_hlevel = line.match(/^#+[^#]/)[0].length - 1;

        var section_spec = {
          tag: 'div',
          text: undefined,
          props: {
            class: 'section level_'+new_hlevel
          },
          children: [],
        };

        var level_offset = new_hlevel - h_level;
        if( new_hlevel >= 2 && ! h_parent[h_level+level_offset-1] ) {
          var parent_spec = {
            tag: 'div',
            text: undefined,
            props: {
              class: 'section level_'+new_hlevel-1
            },
            children: [],
          };
          h_parent[h_level+level_offset-1-1].push(parent_spec);
          h_parent[h_level+level_offset-1] = parent_spec.children;
        }

        h_parent[h_level+level_offset-1].push(section_spec);
        h_level = new_hlevel;
        h_parent[h_level] = section_spec.children;

        h_parent[h_level].push({
          tag: 'h'+new_hlevel,
          children: process_text(clean_text),
        });
      } else if( line_trimed[0] === '*' || line_trimed[0] === '+' || line_trimed[0] === '-' ){ // bullet list
        var indent_delta = indent - lastIndent;
        lastIndent = indent;

        if( ! root_ul ){
          root_ul = {
            tag: 'ul',
            props: {
              class: 'list_level_0'
            },
            children: [],
          };
          l_parent[0] = root_ul.children;
        }

        if( indent_delta === 0 ){
          //l_level = l_level;
        } else if( indent_delta > 0 ) {
          l_level++;
          var ul = {
            tag: 'ul',
            props: {
              class: 'list_level_'+l_level
            },
            children: [],
          };
          //h_parent[h_level].push(ul);
          l_parent[l_level] = ul.children;
          l_parent[l_level-1].push( ul );
        } else if( indent_delta < 0 ) {
          l_level--;
        }
        //if( ! l_parent[l_level] ){
        //  l_parent[l_level] = [];
        //}

        //console.log('* ', indent_delta, l_level, line, clean_text);

        l_parent[l_level].push({
          tag: 'li',
          props: {
            class: 'list_level_'+l_level
          },
          children: process_text(clean_text),
        });

      } else if( line.match(/^[0-9]/) ){ // numbered list
        h_parent[h_level].push({
          tag: 'ol',
          children: process_text(clean_text),
        });
      } else if( line.match(/^-{3}/) ){ // --- horizontal line
        h_parent[h_level].push({
          tag: 'hr',
          children: process_text(clean_text),
        });
      }

    }

  });

  return 'module.exports = ' + JSON.stringify(specs);
};
