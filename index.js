import simpleGit from 'simple-git';
import fs from 'fs';
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
                console.log(
                    'Das Verzeichnis `caniemail` ist kein Git-Repository.',
                );
                return false;
            }
        } else {
            console.log('Das Verzeichnis `caniemail` existiert nicht.');
            return false;
        }
    } catch (error) {
        console.error('Ein Fehler ist aufgetreten:', error);
        return false;
    }
};

console.log('checkIfRepoExists', await checkIfRepoExists());

const updateService = new UpdateService();
