import {Pipe, PipeTransform} from "@angular/core";
import {PostInfoDtoInterface} from "../services/forum.service";


@Pipe({
  name: "searchPipe",
  standalone: true,
})
export class SearchPipe implements PipeTransform {
  transform(value: PostInfoDtoInterface[], args?: string): PostInfoDtoInterface[] {
    if (!value) return null;
    if (!args) return value;

    args = args.toLowerCase();
    const regex = new RegExp(`(${args})`, 'gi');
    return value.filter(item =>
      item.title.toLowerCase().includes(args) ||
      item.description.toLowerCase().includes(args) ||
      item.author.toLowerCase().includes(args)
    )
  .map(item => ({
      ...item,
      title: item.title.replace(regex, '<span class="highlight-text">$1</span>'),
      description: item.description.replace(regex, '<span class="highlight-text">$1</span>'),
      author: item.author.replace(regex, '<span class="highlight-text">$1</span>')
    }));
  }
}
