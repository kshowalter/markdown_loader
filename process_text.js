//ar re_find_links = /\[(.*?)\]\((.+?)\)/g;
//var re_split_line = /\[!\[.*?\]\(.+?\)\]\(.+?\)|(\[.*?\]\(.+?\)|!\[.*?\]\(.+?\))/g;
//var re_split_line = /!\[(.*?)\]\((.+?)\)|(\[.*?\]\(.+?\))/g;
//var re_split_links = /\[(.*?)\]\((.+?)\)/;
var re_split_links = /\(|\)|\[|\]/g;
var re_split_images = /!\[(.*?)\]\((.+?)\)/;

function get_props(string){
  var desc_parts = {
    text: '',
    props: {}
  };
  var desc_halves = string.split('|');
  desc_parts.text = desc_halves[0];
  if( desc_halves[1] ){
    var props_parts = desc_halves[1].split(/ |,/g);
    props_parts.forEach(function(prop_string){
      var value_parts = prop_string.trim().split(/:|=/g);
      desc_parts.props[value_parts[0]] = value_parts[1];
    });
  }

  return desc_parts;
}



/**
 * .
 * @exports
 */
module.exports = function process_text(line_string){
  var line_array = [];

  var triggers = [
    '!',
    '[',
  ];
  var closers = {
    '!': ')',
    '[': ')'
  };

  var hopper = [];
  var mark = 0;

  for( var c = 0; c<line_string.length; c++){
    //console.log(c, line_string[c]);
    var trigger_index = triggers.indexOf(line_string[c]);
    if( line_string[c] === '[' && line_string[c-1] === '!'){
      trigger_index = -1;
    }
    if( trigger_index !== -1 ){
      var trigger = triggers[trigger_index];
      var plain_text = line_string.slice(mark,c);
      if( plain_text.trim() !== ''){
        line_array.push( plain_text );
      }
      mark = c+1;

      hopper.push(
        {
          trigger: trigger,
          start: c,
          //mid: false,
          end: false,
          children: []
        }
      );

    } else if( hopper[hopper.length-1] && line_string[c] === closers[hopper[hopper.length-1].trigger] ){
      mark = c+1;
      var special = hopper.pop(); //[hopper.length-1];
      special.end = c+1;
      var to_convert = line_string.slice(special.start, special.end);

      var container;
      if( hopper[hopper.length-1] && hopper[hopper.length-1].children ){
        container = hopper[hopper.length-1].children;
      } else {
        container = line_array;
      }

      if( special.trigger === '!' ){
        var img_parts = to_convert.split(re_split_images);
        var desc_parts = get_props(img_parts[1]);
        var props = desc_parts.props || undefined;
        props.src = img_parts[2];
        props.alt = desc_parts.text;
        container.push({
          tag: 'img',
          props: props
        });
      } else if( special.trigger === '['){
        var link_parts = to_convert.split(re_split_links);
        var children;
        var href;
        if( link_parts.length >= 7 ){ //image link
          children = special.children || [ link_parts[2] ];
          href = link_parts[7];
        } else { // text link
          children = [ link_parts[1] ];
          href = link_parts[3];
        }
        container.push({
          tag: 'a',
          children: children,
          props: {
            href: href
          }
        });
      }
    }
  }

  c = line_string.length;
  var plain_text = line_string.slice(mark,c);
  //console.log('plain_text e: ', plain_text);
  if( plain_text.trim() !== ''){
    line_array.push( plain_text );
  }

  return line_array;
};
