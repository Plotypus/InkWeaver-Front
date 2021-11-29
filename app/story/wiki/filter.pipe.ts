import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "filter",
})
export class FilterPipe implements PipeTransform {
  transform(text: any, args: any[]): any {
    // args[0] says what type of filter is needed
    if (args[0] === "heading") {
      // filter items array, items which match and return true will be kept, false will be filtered out
      return args[1].filter((heading) => heading.title === text);
    } else if (args[0] === "ref") {
      // filters references by story id
      return text.filter((ref: any) => {
        return JSON.stringify(ref.story_id) === JSON.stringify(args[1]);
      });
    } else {
      return text;
    }
  }
}
