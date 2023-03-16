import ErrorModel from './../03-models/error-model';




export function validateDateString(dateString: string): Date {
    const dateRegex = /^\d{4}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
        throw new ErrorModel(400, `Invalid date format. Must be: YYYY-MM-DD`)
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        throw new ErrorModel(400, `Invalid Date`)
    }
    if (date <= new Date()) {
        throw new ErrorModel(400, `Date must be after the current date`);
    }
    return date;
}
