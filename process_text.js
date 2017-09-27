

//ar re_find_links = /\[(.*?)\]\((.+?)\)/g;
var re_split_line = /\[!\[.*?\]\(.+?\)\]\(.+?\)|(\[.*?\]\(.+?\)|!\[.*?\]\(.+?\))/g;
//var re_split_line = /!\[(.*?)\]\((.+?)\)|(\[.*?\]\(.+?\))/g;
var re_split_links = /\[(.*?)\]\((.+?)\)/;
var re_split_images = /!\[(.*?)\]\((.+?)\)/;

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
  //var midpoints = {
  //  '!': ')',
  //  '[': ']'
  //}
  var closers = {
    '!': ')',
    '[': ')'
  };

  var hoppers = [];
  var mark = 0;

  for( var c = 0; c<line_string.length; c++){
    //console.log(c, line_string[c]);
    var trigger_index = triggers.indexOf(line_string[c]);
    if( trigger_index !== -1 ){
      var trigger = triggers[trigger_index];
      //console.log('triggered at: ', c, trigger, line_string[c]);
      var plain_text = line_string.slice(mark,c);
      if( plain_text.trim() !== ''){
        line_array.push( plain_text );
      }
      mark = c;

      hoppers.push(
        {
          trigger: trigger,
          start: c,
          //mid: false,
          end: false
        }
      );

    } else if( hoppers[hoppers.length-1] && line_string[c] === closers[hoppers[hoppers.length-1].trigger] ){
      mark = c;
      var hopper = hoppers.pop(); //[hoppers.length-1];
      hopper.end = c+1;
      var to_convert = line_string.slice(hopper.start, hopper.end);
      if( hopper.trigger === '!' ){
        var img_parts = to_convert.split(re_split_images);
        line_array.push({
          tag: 'img',
          props: {
            alt: img_parts[1],
            src: img_parts[2]
          }
        });
      } else if( hopper.trigger === '['){
        var link_parts = to_convert.split(re_split_links);
        line_array.push({
          tag: 'a',
          text: link_parts[1],
          props: {
            href: link_parts[2]
          }
        });

      }
    }
  }

  c = line_string.length;
  var plain_text = line_string.slice(mark,c);
  if( plain_text.trim() !== ''){
    line_array.push( plain_text );
  }

  return line_array;
};
