// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import scss from 'rollup-plugin-scss';
import path from 'path';
import {fileURLToPath} from 'url';

import packagejson from './package.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webappRoot = path.resolve(__dirname, '../..');

const externals = [
    ...Object.keys(packagejson.dependencies || {}),
    ...Object.keys(packagejson.peerDependencies || {}),
    '@workspace/compass-icons/components',
    'lodash/throttle',
    'react',
    'workspace-redux',
    'reselect',
];

const isExternal = (id) => {
    return externals.includes(id) || id.startsWith('@workspace/');
};

export default [
    {
        input: 'src/index.tsx',
        output: [
            {
                sourcemap: true,
                file: packagejson.module,
                format: 'es',
                globals: {'styled-components': 'styled'},
            },
        ],
        plugins: [
            scss({
                fileName: 'index.esm.css',
                outputToFilesystem: true,
            }),
            resolve({
                browser: true,
                extensions: ['.ts', '.tsx'],
                jail: webappRoot,
                modulePaths: [
                    path.resolve(webappRoot, 'node_modules'),
                ],
            }),
            commonjs(),
            typescript({
                outputToFilesystem: true,
            }),
        ],
        external: isExternal,
        watch: {
            clearScreen: false,
        },
    },
];
