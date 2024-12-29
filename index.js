import simpleGit from 'simple-git';
import fs from 'fs';
import { exec } from '@actions/exec';
import { UpdateService } from './update.service.js';

const git = simpleGit();

const checkIfRepoExists = async () => {
    try {
        const dirPath = './caniemail';

        if (fs.existsSync(dirPath)) {
            // Change the current directory to "caniemail"
            process.chdir('./caniemail');

            // Check if the current directory is a Git repository
            const isRepo = await git.checkIsRepo();
            if (isRepo) {
                return true;
            } else {
                console.error(
                    'Das Verzeichnis `caniemail` ist kein Git-Repository.',
                );
                return false;
            }
        } else {
            console.error('Das Verzeichnis `caniemail` existiert nicht.');
            return false;
        }
    } catch (error) {
        console.error('Ein Fehler ist aufgetreten:', error);
        return false;
    }
};

if (!checkIfRepoExists()) {
    console.error('Das Verzeichnis `caniemail` existiert nicht.');
    process.exit(1);
}

const updateService = new UpdateService();
const apiData = await updateService.fetchApiData();
const apiDataPath = './api.json';

await exec.exec('git checkout -b data || git checkout data');
await exec.exec('git pull origin data', [], { ignoreReturnCode: true });

await fs.promises.writeFile(apiDataPath, JSON.stringify(apiData, null, 2));

await exec.exec('git add api.json README.md LICENSE').then(async () => {
    await exec.exec('git commit -m "Updated API data"').catch(async () => {
        console.log('No changes to commit');
    });
    await exec.exec('git push origin data');
});
