import path from 'path';

import ShowboxError from './showbox-error';
import image        from './image';

function parse(str) {
    let match = str.match(/!([^\s]+)(\s(.*))?/);
    if ( match ) {
        return [match[1], match[3]];
    } else {
        return [];
    }
}

function isCommand(node) {
    return node.type === 'paragraph' &&
           node.children[0].type === 'text' &&
           node.children[0].value[0] === '!';
}

function split(node) {
    return node.children[0].value.split('\n').map( s => s.trim() );
}

export default function commands(root, base) {
    let changed = {
        type:     root.type,
        children: [],
        position: root.position
    };
    let data = { };

    for ( let i of root.children ) {
        if ( isCommand(i) ) {
            for ( let command of split(i) ) {
                let [name, param] = parse(command);

                if ( name === 'type' ) {
                    if ( !data.types ) data.types = [];
                    data.types.push(param);

                } else if ( name === 'image' ) {
                    changed.children.push({
                        type:  'html',
                        value: image(path.join(base, param))
                    });

                } else if ( name === 'theme' ) {
                    data.theme = param;

                } else {
                    throw new ShowboxError('Unknown command !' + name);
                }
            }

        } else {
            changed.children.push(i);
        }
    }

    return [changed, data];
}
