export class LocationInput {
	constructor(name, position, axis, cs, min, max, rel) {
	  this.name = name;
	  this.position = position;
	  this.axis = axis;
	  this.cs = cs; // units
	  this.min = min;
	  this.max = max;
	  this.rel = rel;
	}
  
	validateInput() {
	  // name is required
	  // axis is required
	  // cs is required
	  // position is not required, will default to top-left
	  // min max fallbacks, map-meta -> projection
	  // rel not required, default is image/extent
	  // checks here...
	  return;
	}
}
