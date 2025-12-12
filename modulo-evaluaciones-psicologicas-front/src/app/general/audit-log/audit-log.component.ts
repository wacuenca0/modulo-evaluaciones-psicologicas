import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../../services/audit.service';
import { AppNavComponent } from '../nav/app-nav.component';

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  imports: [CommonModule, FormsModule, AppNavComponent],
})
export class AuditLogComponent implements OnInit {
  logs: any[] = [];
  loading = false;
  page = 0;
  size = 20;
  from?: string;
  to?: string;

  constructor(private readonly audit: AuditService) {}

  prevPage() {
    this.page = Math.max(0, this.page - 1);
    this.load();
  }

  nextPage() {
    this.page = this.page + 1;
    this.load();
  }
  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.audit.getLogs(this.from, this.to, this.page, this.size).subscribe({ next: (res: any) => { this.logs = res?.content || res || []; this.loading = false; }, error: () => this.loading = false });
  }
}
