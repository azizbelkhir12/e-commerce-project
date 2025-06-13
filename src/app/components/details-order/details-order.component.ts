import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { ReviewService } from '../../services/review.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-details-order',
  templateUrl: './details-order.component.html',
  styleUrl: './details-order.component.css',
})
export class DetailsOrderComponent implements OnInit {
  @Input() order: any | null = null;
  @Output() close = new EventEmitter<void>();
  products: any[] = [];

  constructor(private reviewService: ReviewService) {}
  ngOnInit(): void {
    this.getAllProsucts();
    console.log('Order details from parent component:', this.products);
  }

  closePopup(): void {
    this.close.emit();
  }

  getAllProsucts() {
    this.order?.products.forEach((product: any) => {
      this.getProduct(product.product);
    });
  }

  getProduct(productId: string) {
    this.reviewService.getProduct(productId).subscribe(
      (response) => {
        console.log('Product details:', response);
        this.products.push(response);
      },
      (error) => {
        console.error('Error fetching product details:', error);
      }
    );
  }
  generatePDF(): void {
    const element = document.getElementById('receipt-content');
    const noPrintElements = element?.querySelectorAll('.no-print');

    if (!element) return;

    // Temporarily hide buttons
    noPrintElements?.forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });

    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // Open in iframe and auto print
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);

      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      };

      // Restore buttons
      noPrintElements?.forEach((el) => {
        (el as HTMLElement).style.display = '';
      });
    });
  }
}
