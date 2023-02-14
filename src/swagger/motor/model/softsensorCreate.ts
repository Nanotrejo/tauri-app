/**
 * FastAPI
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 0.1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


/**
 * Soft sensor used to create a new one  @argument name: the name given by the user to the script @argument units: the units of the result of the script (e.g ml/min) this field is purely informative @argument script_function: the function that the script will execute @attribute sampling_time: Time that takes the soft sensor to refresh it\'s data @attribute description: A brief text explanation of the soft sensor @attribute variables: A string of the system variables used in the script, that will be transformed into a list
 */
export interface SoftsensorCreate { 
    name: string;
    units: string;
    script_function: string;
    sampling_time: number;
    description: string;
    variables: Array<any>;
}
