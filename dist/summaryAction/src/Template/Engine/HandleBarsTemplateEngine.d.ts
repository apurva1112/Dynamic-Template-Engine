/** Copyright (c) 2020 GitHub. This code is licensed under MIT license (see LICENSE(https://github.com/github/event-transformer/blob/feature/chatops/LICENSE) for details) */
import * as Handlebars from 'handlebars';
import ITemplateEngine from '../Core/ITemplateEngine';
export default class HandleBarsTemplateEngine implements ITemplateEngine {
    constructor();
    /**
     * Registers the template with the template engine by compiling and storing the compiled method
     * TODO :: Add parials template support
     *
     * @param {string} templateId - id used to store the precompiled template
     * @param {string} template - template to register
     * @param {JSON} options - provide options such as partial or not
     */
    registerTemplate(templateId: string, template: string, options?: JSON): void;
    /**
     * Apply the template using the data provided
     *
     * @param {string} templateId - id with which the compiled template is stored
     * @param {JSON} dataModel - data to apply to the template
     */
    applyTemplate(templateId: string, dataModel: JSON): string;
    /**
      * Register custom helper functions with template engine.
      *
      * @param helperName name of the helper to register
      * @param helperFunc the implementation of helper function
      */
    registerHelper(helperName: string, helperFunc: Handlebars.HelperDelegate): void;
    /**
    * Register custom tag with template engine.
    *
    * @throws FunctionalityNotSupportedError if the engine does not support custom tags/extensions
    */
    registerTag(): void;
    private preCompiledTemplateMap;
}
