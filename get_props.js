module.exports = function get_props(string){
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
