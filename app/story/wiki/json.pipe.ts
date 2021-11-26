import { Pipe } from '@angular/core';

@Pipe({
    name: 'Json'
})
export class JsonPipe {
	transform(text: any): any {
		// filter items array, items which match and return true will be kept, false will be filtered out
		return JSON.stringify(text);
	}
}
