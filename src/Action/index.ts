import * as core from '@actions/core';
import * as github from '@actions/github';
import CardRenderer from '../Transformer/CardRenderer/CardRenderer';
import EventTransformer from '../Transformer/EventTransformer/EventTransformer';
import TemplateManager from '../TemplateManager';
import { ClientType, TemplateType } from '../Transformer/Core/TransformContract';

const TemplateTypeMap = new Map<string, TemplateType>(Object.entries(TemplateType).map(
  ([key, value]:[string, TemplateType]) => [key, value],
));

const ClientTypeMap = new Map<string, ClientType>(Object.entries(ClientType).map(
  ([key, value]:[string, ClientType]) => [key, value],
));

function throwIfUndefined<T>(value: T|undefined): T {
  if (value) {
    return value;
  }
  throw new Error('Undefined value found');
}

async function run(): Promise<void> {
  try {
    const options: core.InputOptions = { required: true };
    const repoName: string = core.getInput('repoName', options);
    const branch: string = core.getInput('branchName', options);
    const templateTypeString = core.getInput('templateType', options);
    const sourceType: string = core.getInput('sourceType', options);
    const clientTypeString: string = core.getInput('clientType');
    const accessToken: string = core.getInput('accessToken');
    let data: string = core.getInput('data');
    core.debug(`Data Received: ${data}`);
    core.debug(`Trying to remove invisble characters`);
    // data = data.replace(/\\n/g, '\\n')
    //   .replace(/\\'/g, "\\'")
    //   .replace(/\\"/g, '\\"')
    //   .replace(/\\&/g, '\\&')
    //   .replace(/\\r/g, '\\r')
    //   .replace(/\\t/g, '\\t')
    //   .replace(/\\b/g, '\\b')
    //   .replace(/\\f/g, '\\f');
    // // remove non-printable and other non-valid JSON chars
    // data = data.replace(/[\u0000-\u0019]+/g, '');
    core.debug(`Data After CleanUp: ${data}`);
    const dataJson: JSON = JSON.parse(data);
    core.debug(`Done parsing input data`);
    const templateType: TemplateType = throwIfUndefined<TemplateType>(
      TemplateTypeMap.get(templateTypeString),
    );
    let clientType: ClientType | undefined;
    if (clientTypeString) {
      clientType = throwIfUndefined<ClientType>(
        ClientTypeMap.get(clientTypeString),
      );
    }
    let renderedTemplate: string;
    await TemplateManager.setupTemplateConfigurationFromRepo(repoName, branch, sourceType,
      templateType, clientType, accessToken);
    if (clientType != null) {
      const cardRenderer = new CardRenderer();
      renderedTemplate = await cardRenderer.ConstructCardJson(templateType, sourceType, clientType,
        dataJson);
    } else {
      const eventTransformer = new EventTransformer();
      renderedTemplate = await eventTransformer.ConstructEventJson(templateType, sourceType,
        dataJson);
    }
    core.debug(`Calculated template: ${renderedTemplate}`);
    renderedTemplate = JSON.parse(renderedTemplate);
    core.setOutput('renderedTemplate', renderedTemplate);
    const octokit = github.getOctokit(accessToken);
    const { owner, repo } = github.context.repo;
    const event_type = 'custom';
    octokit.repos.createDispatchEvent({
      owner,
      repo,
      event_type,
      client_payload: renderedTemplate,
    });
  } catch (error) {
    core.setFailed(error);
  }
}

run();
