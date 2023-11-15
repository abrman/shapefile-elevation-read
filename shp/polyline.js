export default function(record) {
  var i = 44, // starting byte position of polyline points
      j, // declare for loop iterator to prevent declaring new variables just to be collected by javascript garbage collector
      k = record.getInt32(0, true), // get shape type
      n = record.getInt32(36, true), // number of parts
      m = record.getInt32(40, true), // number of points
      parts = new Array(n), // declare empty array of length as defined by shapefile parts count
      points = new Array(m); // declare empty array of length as defined by shapefile points count
  for (j = 0; j < n; ++j, i += 4) // start reading at byte 44 as defined on line 2, and read as many parts as defined `n` to learn how many points belong to which line
    parts[j] = record.getInt32(i, true);
  for (j = 0; j < m; ++j, i += 16) // start reading at byte (44 + 4 * n), and read as many points as defined `m` to get point X and Y coordinates
    points[j] = [record.getFloat64(i, true), record.getFloat64(i + 8, true)];
  if ( k === 13 ){ // if shape type indicates polylineZ (polyline with Z elevation)
    i+= 16 // skip reading min/maxZ bytes (similar to x/y bounding box)
    for (j = 0; j < m; ++j, i += 8) // continue reading elevation data for all points
      points[j][2] = record.getFloat64(i, true);
  }

  return n === 1
      ? {type: "LineString", coordinates: points}
      : {type: "MultiLineString", coordinates: parts.map(function(i, j) { return points.slice(i, parts[j + 1]); })};
};
