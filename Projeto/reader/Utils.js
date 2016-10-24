/**
 *Parses the given tag and returns a Vec3 with the result.
 * Attributes are named x, y and z concatenated with the number.
 */
function parseVec3(reader, tag, number) {
    if (!number)
        number = '';

    let z = reader.getFloat(tag, 'z' + number, true);

    let vec3 = parseVec2(reader, tag, number);
    vec3.push(z);

    return vec3;
}

/**
 *Parses the given tag and returns a Vec4 with the result.
 * Attributes are named x, y, and w concatenated with the number.
 */
function parseVec4(reader, tag, number) {
   if (!number)
       number = '';

    let w = reader.getFloat(tag, 'w' + number, true);

    let vec4 = parseVec3(reader, tag, number);
    vec4.push(w);

    return vec4;
}

/**
 * Parses the vector from the given tag attributes.
 * Attributes are named x and y concatenated with the number.
 */
function parseVec2(reader, tag, number) {
    if (!number)
        number = '';

    let x = reader.getFloat(tag, 'x' + number, true);
    let y = reader.getFloat(tag, 'y' + number, true);

    return [x, y];
}

/**
 * Parses the RGBA attributes from the given tag.
 * Returns a vector with the result.
 */
function parseRGBA(reader, tag) {
    let r = reader.getFloat(tag, 'r', true);
    let g = reader.getFloat(tag, 'g', true);
    let b = reader.getFloat(tag, 'b', true);
    let a = reader.getFloat(tag, 'a', true);

    return [
        r, g, b, a
    ];
}

/**
 * Parses a transformation block, creating the appropriate object
 */
function parseTransformation(scene, reader, tag) {
    let transformation = new Transformation(scene);

    switch (tag.nodeName) {
        case 'translate':
            {
                let vec = parseVec3(reader, tag);
                transformation.translate(vec[0], vec[1], vec[2]);
            }
            break;
        case 'rotate':
            let axis = reader.getString(tag, 'axis', true);            
            let angle = reader.getFloat(tag, "angle", true);

            switch (axis) {
                case 'x':
                    transformation.rotate(angle, 1, 0, 0);
                    break;
                case 'y':
                    transformation.rotate(angle, 0, 1, 0);
                    break;
                case 'z':
                    transformation.rotate(angle, 0, 0, 1);
                    break;
                default:
                    throw new Error('Invalid rotation axis.');
                    return null;
            }
            break;
        case 'scale':
            {
                let vec = parseVec3(reader, tag);
                transformation.scale(vec[0], vec[1], vec[2]);
            }
            break;
        default:
            throw new Error('Invalid node name.');
            return null;
    }

    return transformation;
}
