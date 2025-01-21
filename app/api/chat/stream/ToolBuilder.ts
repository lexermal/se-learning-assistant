import { z } from "zod";

type BasicType = string | number | boolean;

export default class ToolBuilder {

  private tools = {} as any;

  public addClientTool(name: string, description = "") {
    let parameters = z.object({});

    const builder = {
      addParameter: (name: string, type: BasicType, description: string) => {
        parameters = parameters.extend({
          [name]: this.buildParameter(type, description)
        });
        return builder;
      },
      build: () => {
        this.tools[name] = {
          description,
          parameters
        }
      }
    }
    return builder;
  }

  public addUserInteractionTool(name: string, description = "") {
    return this.addClientTool(name, description);
  }

  public addServerTool(name: string, description = "") {
    let parameters = z.object({});

    const builder = {
      addParameter: (name: string, type: BasicType, description: string) => {
        parameters = parameters.extend({
          [name]: this.buildParameter(type, description)
        });
        return builder;
      },
      build: <T, W>(fn: (params: T) => Promise<W>) => {
        this.tools[name] = {
          description,
          parameters,
          execute: fn,
        }
      }
    }
    return builder;
  }

  private buildParameter(type: BasicType, description: string) {
    if (typeof type === 'string') {
      return z.string().describe(description);
    } else if (typeof type === 'number') {
      return z.number().describe(description);
    } else if (typeof type === 'boolean') {
      return z.boolean().describe(description);
    }
    return z.object({}).describe(description);
  }

  getTools() {
    return this.tools;
  }

}

// const toolBuilder = new ToolBuilder();

// toolBuilder.addClientTool('getLocation', 'Get the user location. Always ask for confirmation before using this tool.')
//   .addParameter('city', 'string', 'The city to get the weather information for.')
//   .build();

// toolBuilder.addUserInteractionTool('askForConfirmation', 'Ask the user for confirmation.')
//   .addParameter('message', 'string', 'The message to ask for confirmation.')
//   .build();

// toolBuilder.addServerTool('getWeatherInformation', 'Show the weather in a given city to the user.')
//   .addParameter('city', 'string', 'The city to get the weather information for.')
//   .build<{ city: string }, string>(async ({ city }) => {
//     console.log('server action getWeatherInformation', city);
//     const weatherOptions = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'];
//     return weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
//   });

// toolBuilder.addUserInteractionTool("explanationUnderstood", "Evaluate the explanation of a topic in easy terms.")
//   .addParameter("explanationUnderstood", "boolean", "if the explanation was understood. TRUE or FALSE")
//   .addParameter("explanation", "string", "The explanation why it was understood or not, directed to the user directly")
//   .addParameter("improvementHints", "string", "hints for improvement, directed to the user directly")
//   .build();

// toolBuilder.addUserInteractionTool("oppinionChanged", "Evaluate if the user managed to change your oppinion.")
//   .addParameter("studentKnowsTopic", "boolean", "if the student knows the topic in depth and explained it right. TRUE or FALSE")
//   .addParameter("explanation", "string", "The explanation why the oppinion was changed or not")
//   .addParameter("improvementHints", "string", "hints for improvement, directed to the user directly")
//   .build();



// toolBuilder.addUserInteractionTool("conceptApplied", "Evaluate if the user managed to apply the concept in the given setting.")
//   .addParameter("studentAppliesConcept", "boolean", "if the student managed to apply the concept in the given setting. TRUE or FALSE")
//   .addParameter("explanation", "string", "The explanation how well or not he applied the concept in the setting")
//   .addParameter("improvementHints", "string", "hints for improvement, directed to the user directly")
//   .build();

// toolBuilder.addClientTool("storyEnded", "End the story. The user has reached the end of the story.")
//   .build();

// toolBuilder.getTools();