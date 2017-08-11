/**
 * .
 * @exports
 */
module.exports = function(markdown_text){
  var lines = markdown_text.split('\n');
  var specs = {
    tag: 'div',
    props: {
      class: 'level_0'
    },
    children: [],
  };

  var re_indent = /^[ ]+/;
  //var re_special = /^\#+|^\*|^\-{3}/;
  var re_special = /^\#+|^ *\*|^ *[0-9]|^\-{3}/;
  //ar re_find_links = /\[(.*?)\]\((.+?)\)/g;
  var re_split_line = /(\[.*?\]\(.+?\))/g
  var re_split_links = /\[(.*?)\]\((.+?)\)/;

  var lastIndent = 0;

  var paragraph_children = [];

  var level = 0;
  var parent = [
    specs.children
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

    //var spec = {
    //  tag: false,
    //  text: false
    //};

    if( line === '' || special_match ){ // blank line or speial character
      // Complete paragraph
      if( paragraph_children[0] ){
        parent[level].push({
          tag: 'p',
          children: paragraph_children,
        });
        paragraph_children = [];
      }
    }

    if( ! special_match ) { // paragraph line
      if( line !== '' ){
        var line_sections = line.split(re_split_line);
        if( line_sections.length !== 1 ){
          line_sections.forEach(function(line_section){
            if( line_section !== ''){
              var link_parts = line_section.split(re_split_links);
              if( link_parts.length !== 1 ){
                paragraph_children.push({
                  tag: 'a',
                  text: link_parts[1],
                  props: {
                    href: link_parts[2]
                  }
                });
              } else {
                paragraph_children.push(line_section);
              }
            }
          });
        } else {
          paragraph_children.push(line);
        }
      }
    } else { // special

      var clean_text = line.slice(special_match[0].length).trim();

      if( line[0] === '#' ){ // new heading
        var new_hlevel = line.match(/^#+[^#]/)[0].length - 1;
        var section_spec = {
          tag: 'div',
          text: undefined,
          props: {
            class: 'section level_'+new_hlevel
          },
          children: [],
        };

        var level_offset = new_hlevel - level;

        if( new_hlevel >= 2 && ! parent[level+level_offset-1] ) {
          var parent_spec = {
            tag: 'div',
            text: undefined,
            props: {
              class: 'section level_'+new_hlevel-1
            },
            children: [],
          };
          parent[level+level_offset-1-1].push(parent_spec);

          parent[level+level_offset-1] = parent_spec.children;

        }

        parent[level+level_offset-1].push(section_spec);
        level = new_hlevel;
        parent[level] = section_spec.children;



        parent[level].push({
          tag: 'h'+new_hlevel,
          text: clean_text,
        });
      } else if( line[0] === '*' ){
        parent[level].push({
          tag: 'ul',
          text: clean_text,
        });
      } else if( line.match(/^[0-9]/) ){
        parent[level].push({
          tag: 'ol',
          text: clean_text,
        });
      } else if( line.match(/^-{3}/) ){
        parent[level].push({
          tag: 'hr',
          text: clean_text,
        });
      }

    }

  });

  return 'module.exports = ' + JSON.stringify(specs);
};
