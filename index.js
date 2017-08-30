var process_text = require('./process_text');

/**
 * .
 * @exports
 */
module.exports = function(markdown_text){
  var lines = markdown_text.split('\n');

  var re_indent = /^[ ]+/;
  //var re_special = /^\#+|^\*|^\-{3}/;
  var re_special = /^#+|^ *\*|^ *\+|^ *-|^ *[0-9]+\.|^-{3}/;

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
  var ul_lastIndent = 0;
  var ul_level = 0;
  var ul_parent = [];

  var root_ol = false;
  var ol_lastIndent = 0;
  var ol_level = 0;
  var ol_parent = [];

  lines.forEach(function(line, i){
    var indent;
    if( line.match(re_indent) ){
      indent = Math.floor(line.match(re_indent)[0].length/2);
    } else {
      indent = 0;
    }
    var special_match = line.trim().match(re_special);

    var line_trimed = line.trim();



    if( line_trimed === '' ){ // blank line or speial character

      ul_level = 0;
      ul_lastIndent = 0;
      if( root_ul ){
        h_parent[h_level].push(root_ul);
        root_ul = false;
        ul_parent = [];
      }

      ol_level = 0;
      ol_lastIndent = 0;
      if( root_ol ){
        h_parent[h_level].push(root_ol);
        root_ol = false;
        ol_parent = [];
      }

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
      console.log('PPPPPPP')
    } else { // special
      console.log('XXXXX', special_match[0].length, line );
      var clean_text = line.trim().slice(special_match[0].length).trim();
      console.log(clean_text);

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
        var indent_delta = indent - ul_lastIndent;
        ul_lastIndent = indent;

        if( ! root_ul ){
          root_ul = {
            tag: 'ul',
            props: {
              class: 'list_level_0'
            },
            children: [],
          };
          ul_parent[0] = root_ul.children;
        }

        if( indent_delta > 0 ) {
          ul_level++;
          var ul = {
            tag: 'ul',
            props: {
              class: 'list_level_'+ul_level
            },
            children: [],
          };
          //h_parent[h_level].push(ul);
          ul_parent[ul_level] = ul.children;
          ul_parent[ul_level-1].push( ul );
        } else if( indent_delta < 0 ) {
          ul_level--;
        }

        ul_parent[ul_level].push({
          tag: 'li',
          props: {
            class: 'list_level_'+ul_level
          },
          children: process_text(clean_text),
        });

      } else if( line_trimed.match(/^[0-9]+\./) ){ // numbered list
        var indent_delta = indent - ol_lastIndent;
        ol_lastIndent = indent;

        if( ! root_ol ){
          root_ol = {
            tag: 'ol',
            props: {
              class: 'list_level_0'
            },
            children: [],
          };
          ol_parent[0] = root_ol.children;
        }

        if( indent_delta > 0 ) {
          ol_level++;
          var ol = {
            tag: 'ol',
            props: {
              class: 'list_level_'+ol_level
            },
            children: [],
          };
          //h_parent[h_level].push(ol);
          ol_parent[ol_level] = ol.children;
          ol_parent[ol_level-1].push( ol );
        } else if( indent_delta < 0 ) {
          ol_level--;
        }

        ol_parent[ol_level].push({
          tag: 'li',
          props: {
            class: 'list_level_'+ol_level
          },
          children: process_text(clean_text),
        });

      } else if( line_trimed.match(/^-{3}/) ){ // --- horizontal line
        h_parent[h_level].push({
          tag: 'hr',
          children: process_text(clean_text),
        });
      }

    }

  });

  return 'module.exports = ' + JSON.stringify(specs);
};
