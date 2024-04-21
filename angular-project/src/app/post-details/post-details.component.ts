import {Component, inject, OnInit, DestroyRef} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ForumService, PostDetailsDtoInterface} from "../services/forum.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-post-details',
  standalone: true,
  imports: [],
  templateUrl: './post-details.component.html',
  styleUrl: './post-details.component.css'
})
export class PostDetailsComponent implements OnInit {
  private forumService: ForumService = inject(ForumService);
  private destroyRef: DestroyRef = inject(DestroyRef);
  public id: number;
  public postDetails: PostDetailsDtoInterface;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    const routeParams = this.route.snapshot.paramMap;
     this.id = Number(routeParams.get('postId'));
     this.forumService.getPostDetails(this.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data =>{
       console.log(data);
       console.log("Oujesd");

     });
  }
}
