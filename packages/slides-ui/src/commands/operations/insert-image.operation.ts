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

import type { ICommand, Nullable, SlideDataModel } from '@univerjs/core';
import { CommandType, IUniverInstanceService, PageElementType } from '@univerjs/core';
import { getImageSize, IImageIoService } from '@univerjs/drawing';
import { CanvasView } from '../../controllers/canvas-view';

export interface IInsertImageOperationParams {
    files: Nullable<File[]>;
    unitId: string;
};

export const InsertSlideFloatImageOperation: ICommand<IInsertImageOperationParams> = {
    id: 'slide.operation.insert-float-image',
    type: CommandType.OPERATION,
    handler: async (accessor, params) => {
        const imageIoService = accessor.get(IImageIoService);
        if (!params?.files?.length) return false;

        const imageParam = await imageIoService.saveImage(params.files[0]);
        if (!imageParam) return false;

        const { imageId, imageSourceType, source, base64Cache } = imageParam;
        const { width, height, image } = await getImageSize(base64Cache || '');

        const univerInstanceService = accessor.get(IUniverInstanceService);
        // const slideData = univerInstanceService.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE);

        const unitId = params.unitId;
        const slideData = univerInstanceService.getUnit<SlideDataModel>(unitId);
        if (!slideData) return false;

        const activePage = slideData.getActivePage()!;
        const elements = Object.values(activePage.pageElements);
        const maxIndex = (elements?.length) ? Math.max(...elements.map((element) => element.zIndex)) : 20;
        const data = {
            id: imageId,
            zIndex: maxIndex + 1,
            left: 0,
            top: 0,
            width,
            height,
            title: '',
            description: '',
            type: PageElementType.IMAGE,
            image: {
                imageProperties: {
                    contentUrl: base64Cache,
                    imageSourceType,
                    source,
                    base64Cache,
                    image,
                },
            },
        };
        activePage.pageElements[imageId] = data;
        slideData.updatePage(activePage.id, activePage);

        const canvasview = accessor.get(CanvasView);
        const sceneObject = canvasview.createObjectToPage(data, activePage.id, unitId);
        if (sceneObject) {
            canvasview.setObjectActiveByPage(sceneObject, activePage.id, unitId);
        }
        // console.log(slideData);

        // {
        //     "id": "background1",
        //     "zIndex": 0,
        //     "left": 0,
        //     "top": 0,
        //     "width": 960,
        //     "height": 540,
        //     "title": "background",
        //     "description": "",
        //     "type": 1,
        //     "image": {
        //         "imageProperties": {
        //             "contentUrl": "https://minio.cnbabylon.com/univer/slide/Picture1.jpg"
        //         }
        //     }
        // }
        return true;
    },
};
