

//ar re_find_links = /\[(.*?)\]\((.+?)\)/g;
var re_split_line = /(\[.*?\]\(.+?\))/g;
//var re_split_line = /!\[(.*?)\]\((.+?)\)|(\[.*?\]\(.+?\))/g;
var re_split_links = /\[(.*?)\]\((.+?)\)/;
var re_split_images = /!\[(.*?)\]\((.+?)\)/;

/**
 * .
 * @exports
 */
module.exports = function(line_string){
  var line_array = [];

  if( line_string !== '' ){
    var line_sections = line_string.split(re_split_line);
    console.log(line_sections)
    if( line_sections.length !== 1 ){
      line_sections.forEach(function(line_section){
        if( line_section !== ''){
          var image_parts = line_section.split(re_split_images);
          var link_parts = line_section.split(re_split_links);
          if( image_parts.length !== 1 ){
            line_array.push({
              tag: 'img',
              props: {
                alt: link_parts[1],
                src: link_parts[2]
              }
            });
          } else if( link_parts.length !== 1 ){
            line_array.push({
              tag: 'a',
              text: link_parts[1],
              props: {
                href: link_parts[2]
              }
            });
          } else {
            line_array.push(line_section);
          }
        }
      });
    } else {
      line_array.push(line_string);
    }
  }

  return line_array;
};
