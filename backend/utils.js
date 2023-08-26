import Joi from 'joi';
export function isJSON(str) {
	try {
		JSON.parse(str);
		return true;
	} catch (error) {
		return false;
	}
}
export async function validateMessageJson(message) {
	const schemaMessage = Joi.object({
		id: Joi.number().required(),
		color: Joi.string().required(),
	});
	const messageValidation = schemaMessage.validate(message);
	if (messageValidation.error) return false;
	return true;
}
