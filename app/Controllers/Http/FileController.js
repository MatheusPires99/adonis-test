'use strict'


const File = use('App/Models/File');
const Helpers = use('Helpers');

class FileController {
  async store ({ request, response }) {
    if (!request.file('file')) {
      return;
    }

    const upload = request.file('file', { size: '2mb' });

    const fileName = `${Date.now()}.${upload.subtype}`;

    await upload.move(Helpers.tmpPath('uploads'), {
      name: fileName,
    });

    if (!upload.moved()) {
      return response.status(401).send({ error: { message: 'Fail to move file' } });
    }

    const file = await File.create({
      file: fileName,
      name: upload.clientName,
      type: upload.type,
      subtype: upload.subtype,
    });

    return file;
  }
}

module.exports = FileController
