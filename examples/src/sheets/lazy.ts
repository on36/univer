/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { PluginCtor } from '@univerjs/core';
import type { IUniscriptConfig } from '@univerjs/uniscript';
import { UniverUniscriptPlugin } from '@univerjs/uniscript';

export default function getLazyPlugins(): [PluginCtor<UniverUniscriptPlugin>, IUniscriptConfig] {
    return [
        UniverUniscriptPlugin,
        {
            getWorkerUrl(moduleID, label) {
                if (label === 'typescript' || label === 'javascript') {
                    return './vs/language/typescript/ts.worker.js';
                }

                return './vs/editor/editor.worker.js';
            },
        },
    ];
}
