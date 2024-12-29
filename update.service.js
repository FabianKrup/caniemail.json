import EventEmitter from 'events';
import { load as loadYaml } from 'js-yaml';
import { basename } from 'path';
import { constants, promises as fs } from 'fs';

import { FeatureTypeChecker, NicenamesTypeChecker } from './format.checker.js';
import { frontmatterParse } from './frontmatter.js';

export class UpdateService extends EventEmitter {
    constructor() {
        super();

        this.fetchApiResponse();
    }

    async fetchApiResponse() {
        const nicenames = await this.fetchNicenames();
        const features = await this.fetchFeatures();

        if (nicenames && features) {
            const apiResponse = {
                last_update_date: new Date().toISOString(),
                nicenames: nicenames,
                data: features,
            };

            console.log('API Response:', apiResponse);
        }
    }

    async fetchNicenames() {
        const filePath = '_data/nicenames.yml';

        try {
            // Check if the file exists and is readable
            await fs.access(filePath, constants.R_OK);

            const file = await fs.readFile(filePath, {
                encoding: 'utf-8',
            });

            if (file) {
                const nicenames = loadYaml(file);

                if (NicenamesTypeChecker.isNicenames(nicenames)) {
                    return nicenames;
                } else {
                    console.error('Invalid nicenames data');
                    return null;
                }
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.error(`The file ${filePath} does not exist.`);
            } else if (error.code === 'EACCES') {
                console.error(`The file ${filePath} is not readable.`);
            } else {
                console.error(
                    'An error occurred while fetching nicenames:',
                    error,
                );
            }
            return null;
        }
    }

    async fetchFeatures() {
        const directoryPath = './caniemail/_features';

        try {
            const directoryEntries = await fs.readdir(directoryPath, {
                withFileTypes: true,
            });
            console.log(directoryEntries[0]);
            const markdownFiles = directoryEntries.filter(
                (dirent) =>
                    dirent.isFile() &&
                    dirent.name.endsWith('.md') &&
                    !dirent.name.startsWith('_'),
            );

            const featureContents = await Promise.all(
                markdownFiles.map(async (dirent) => {
                    const fileContent = await fs.readFile(
                        `./caniemail/_features/${dirent.name}`,
                        { encoding: 'utf-8' },
                    );

                    const temp = frontmatterParse(fileContent, {
                        ignoreDuplicateKeys: true,
                    }).attributes;

                    const feature = {
                        slug: basename(dirent.name, '.md'),
                        description: null,
                        url: '',
                        tags: [],
                        keywords: null,
                        test_url: null,
                        test_results_url: null,
                        notes: null,
                        notes_by_num: null,
                        links: null,
                        ...(typeof temp === 'object' ? temp : {}),
                    };

                    if (FeatureTypeChecker.isFeature(feature)) {
                        return feature;
                    } else {
                        console.error('Invalid feature data');
                        return null;
                    }
                }),
            ).then((results) => results.filter((result) => result !== null));

            return featureContents;
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.error(`The directory ${directoryPath} does not exist.`);
            } else {
                console.error(
                    'An error occurred while fetching features:',
                    error,
                );
            }
            return [];
        }
    }
}
