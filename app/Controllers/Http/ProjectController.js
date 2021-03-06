'use strict'

const Project = use('App/Models/Project');

class ProjectController {
  async index ({ request }) {
    const { page } = request.get();

    const projects = await Project.query()
      .with('user')
      .paginate(page, 10);

    return projects;
  }

  async store ({ request, auth }) {
    const data = request.only(['title', 'description']);

    const project = await Project.create({
      ...data,
      user_id: auth.user.id
    });

    return project;
  }

  async show ({ params, response }) {
    const project = await Project.find(params.id);

    if (!project) {
      return response.status(401).send({ error: { message: 'Project not found' } });
    }

    await project.load('user');
    await project.load('tasks');

    return project;
  }

  async update ({ params, request, response }) {
    const project = await Project.find(params.id);

    if (!project) {
      return response.status(401).send({ error: { message: 'Project not found' } });
    }

    const data = request.only(['title', 'description']);

    project.merge(data);

    await project.save();

    return project;
  }

  async destroy ({ params, request, response }) {
    const project = await Project.find(params.id);

    await project.delete();
  }
}

module.exports = ProjectController
