import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Cart } from 'src/app/common/Cart';
import { CartDetail } from 'src/app/common/CartDetail';
import { Customer } from 'src/app/common/Customer';
import { Favorites } from 'src/app/common/Favorites';
import { Tour } from 'src/app/common/Tour';
import { Rate } from 'src/app/common/Rate';
import { CartService } from 'src/app/services/cart.service';
import { CustomerService } from 'src/app/services/customer.service';
import { FavoritesService } from 'src/app/services/favorites.service';
import { TourService } from 'src/app/services/tour.service';
import { RateService } from 'src/app/services/rate.service';
import { SessionService } from 'src/app/services/session.service';
import { ViewChild } from '@angular/core';
import { SlickCarouselComponent } from 'ngx-slick-carousel';
import { OrderService } from 'src/app/services/order.service';
import { Order } from 'src/app/common/Order';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-tour-detail',
  templateUrl: './tour-detail.component.html',
  styleUrls: ['./tour-detail.component.css']
})


export class TourDetailComponent implements OnInit {
  @ViewChild('slickModal', { static: false }) slickModal!: SlickCarouselComponent;
  @ViewChild('orderModal', { static: true }) orderModal: any;

  tour!: Tour;
  tours!: Tour[];
  id!: number;

  isLoading = true;

  customer!: Customer;
  favorite!: Favorites;
  favorites!: Favorites[];
  totalLike!: number;

  cart!: Cart;
  cartDetail!: CartDetail;
  cartDetails!: CartDetail[];

  rates: Rate[] = [];
  rateAll: Rate[] = [];
  countRate!: number;
  selectedImage: string = '';

  images: string[] = [];
  currentImageIndex: number = 0;

  itemsComment: number = 3;

  tourImageList: string[] = [];
  isGalleryVisible: boolean = false;
  orderModalRef!: NgbModalRef;

  constructor(
    private tourService: TourService,
    private modalService: NgbModal,
    private cartService: CartService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private customerService: CustomerService,
    private favoriteService: FavoritesService,
    private sessionService: SessionService,
    private orderService: OrderService,
    private fb: FormBuilder,
    private rateService: RateService) {
    route.params.subscribe(val => {
      this.ngOnInit();
    })
  }

  slideConfig = { "slidesToShow": 7, "slidesToScroll": 2, "autoplay": true };
  orderForm: FormGroup = new FormGroup({});

  ngOnInit(): void {
    this.modalService.dismissAll();
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });
    this.id = this.route.snapshot.params['id'];
    this.getTour();
    this.getRates();
    this.getTotalLike();
    this.getAllRate();

    this.orderForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      email: [''],
      note: ['']
    });

  }

  mainImageSlideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    dots: false,
    arrows: false,
    infinite: true,
    fade: true,
    speed: 500,
    pauseOnHover: true
  };


  goToSlide(index: number): void {
    this.currentImageIndex = index;
    this.slickModal.slickGoTo(index);
  }

  onAfterChange(event: any) {
    this.currentImageIndex = event.currentSlide;
  }


  onSelectImage(image: string) {
    this.selectedImage = image;
  }

  setItemsComment(size: number) {
    this.getTour();
    this.getRates();
    this.getTotalLike();
    this.getAllRate();
    this.itemsComment = size;
    console.log(this.itemsComment);

  }

  getTour() {
    this.tourService.getOne(this.id).subscribe(data => {
      this.isLoading = false;
      this.tour = data as Tour;
      this.tourService.getSuggest(this.tour.category.categoryId, this.tour.tourId).subscribe(data => {
        this.tours = data as Tour[];
      })
      this.tourService.getTourImageList(this.tour.tourId).subscribe((images: string[]) => {
        // Nếu backend trả về rỗng, fallback về ảnh chính
        this.images = images.length > 0 ? images : [this.tour.image];
        this.selectedImage = this.images[0];
      });

      this.selectedImage = this.images[0];
    }, error => {
      this.toastr.error('Tour du lịch không tồn tại!', 'Hệ thống');
      this.router.navigate(['/home'])
    })
  }

  getRates() {
    this.rateService.getByTour(this.id).subscribe(data => {
      if (this.rates == null) {
        this.rates = [];
      }
      this.rates = data as Rate[];
    }, error => {
      this.toastr.error('Lỗi hệ thống!', 'Hệ thống');
    })
  }

  getAllRate() {
    this.rateService.getAll().subscribe(data => {
      if (this.rateAll == null) {
        this.rateAll = [];
      }
      this.rateAll = data as Rate[];
    })
  }

  getAvgRate(id: number): number {
    let avgRating: number = 0;
    this.countRate = 0;
    if (this.rateAll == null) {
      return 0;
    }
    for (const item of this.rateAll) {
      if (item.tour.tourId === id) {
        avgRating += item.rating;
        this.countRate++;
      }
    }
    return this.countRate == 0 ? 0 : Math.round(avgRating / this.countRate * 10) / 10;
  }

  toggleLike(id: number) {
    let email = this.sessionService.getUser();
    if (email == null) {
      this.router.navigate(['/sign-form']);
      this.toastr.info('Hãy đăng nhập để sử dụng dịch vụ của chúng tôi', 'Hệ thống');
      return;
    }
    this.favoriteService.getByTourIdAndEmail(id, email).subscribe(data => {
      if (data == null) {
        this.customerService.getByEmail(email).subscribe(data => {
          this.customer = data as Customer;
          this.favoriteService.post(new Favorites(0, new Customer(this.customer.userId), new Tour(id))).subscribe(data => {
            this.toastr.success('Thêm thành công!', 'Hệ thống');
            this.favoriteService.getByEmail(email).subscribe(data => {
              this.favorites = data as Favorites[];
              this.favoriteService.setLength(this.favorites.length);
              this.getTotalLike();
            }, error => {
              this.toastr.error('Lỗi truy xuất dữ liệu!', 'Hệ thống');
            })
          }, error => {
            this.toastr.error('Thêm thất bại!', 'Hệ thống');
          })
        })
      } else {
        this.favorite = data as Favorites;
        this.favoriteService.delete(this.favorite.favoriteId).subscribe(data => {
          this.toastr.info('Đã xoá ra khỏi danh sách yêu thích!', 'Hệ thống');
          this.favoriteService.getByEmail(email).subscribe(data => {
            this.favorites = data as Favorites[];
            this.favoriteService.setLength(this.favorites.length);
            this.getTotalLike();
          }, error => {
            this.toastr.error('Lỗi truy xuất dữ liệu!', 'Hệ thống');
          })
        }, error => {
          this.toastr.error('Lỗi!', 'Hệ thống');
        })
      }
    })
  }

  getTotalLike() {
    this.favoriteService.getByTour(this.id).subscribe(data => {
      this.totalLike = data as number;
    })
  }
  getTourImageList(id: number) {
    this.tourService.getTourImageList(id).subscribe((data: string[]) => {
      this.tourImageList = data;
      this.currentImageIndex = 0;  // Reset to the first image
      this.isGalleryVisible = true;  // Show the gallery
    });
  }

  showGallery() {
    console.log("show gallery");
    this.isGalleryVisible = true;
  }

  closeGallery() {
    console.log("close gallery");
    this.isGalleryVisible = false;
  }

  // Show the next image in the list
  nextImage() {
    if (this.currentImageIndex < this.tourImageList.length - 1) {
      this.currentImageIndex++; // Move to the next image
    } else {
      this.currentImageIndex = 0; // Loop back to the first image if at the end
    }
  }

  // Show the previous image in the list
  previousImage() {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--; // Move to the previous image
    } else {
      this.currentImageIndex = this.tourImageList.length - 1; // Loop back to the last image if at the start
    }
  }

  addCart(tourId: number, price: number) {

    let email = this.sessionService.getUser();
    console.log("email: ", email);
    if (email == null) {
      this.router.navigate(['/sign-form']);
      this.toastr.info('Hãy đăng nhập để sử dụng dịch vụ của chúng tôi', 'Hệ thống');
      return;
    }

    this.cartService.getCart(email).subscribe(data => {
      this.cart = data as Cart;

      // ✅ Convert selectedDate (VD: "03/07") -> Date object
      const [day, month] = this.selectedDate.split('/').map(Number);
      const year = new Date().getFullYear(); // bạn có thể tuỳ chỉnh theo logic khác
      const start_date = new Date(year, month - 1, day);

      const end_date = new Date(start_date);
      end_date.setDate(end_date.getDate() + 1); // VD: chuyến 2 ngày

      // ✅ Tính giá theo số lượng
      const totalPrice = price * this.adultCount;

      this.cartDetail = new CartDetail(
        0,
        this.adultCount,
        totalPrice,
        new Tour(tourId),
        new Cart(this.cart.cartId),
        start_date,
        end_date
      );


      this.cartService.postDetail(this.cartDetail).subscribe(data => {
        this.toastr.success('Thêm vào giỏ hàng thành công!', 'Hệ thống!');
        this.cartService.getAllDetail(this.cart.cartId).subscribe(data => {
          this.cartDetails = data as CartDetail[];
          this.cartService.setLength(this.cartDetails.length);
        });
      }, error => {
        this.toastr.error('Tour du lịch này có thể đã hết chỗ!', 'Hệ thống');
        this.router.navigate(['/all-tour']);
        window.location.href = "/all-tour";
      });
    });
  }

  selectedDate: string = '03/07';
  adultCount: number = 2;
  childCount: number = 0;
  infantCount: number = 0;

  selectDate(date: string) {
    this.selectedDate = date;
  }

  updateCount(change: number) {
    if (this.adultCount + change >= 0) {
      this.adultCount += change;
    }
  }

  activeIndex: number | null = null;

  days = [
    {
      label: 'Ngày 1',
      title: 'Tp. Hồ Chí Minh - Narita (Ăn Sáng MB)',
      img: 'https://picsum.photos/158/100?random=1',
      detail: '21:30 hướng dẫn viên sẽ đón quý khách tại sân bay Tân Sơn Nhất làm thủ tục đáp chuyến bay VN306 của hãng hàng không Vietnam Airlines khởi hành đi Tokyo lúc 00:20.Đoàn nghỉ đêm & ăn sáng trên máy bay.'
    },
    {
      label: 'Ngày 2',
      title: 'Narita – Tokyo (Ăn Trưa, Tối)',
      img: 'https://picsum.photos/158/100?random=2',
      detail: 'Chùa cổ Asakusa Kannon – ngôi đền linh thiêng và là một trong những ngôi đền cổ kính nhất hiện nay của Tokyo với kiến trúc truyền thống hết sức đặc trưng.'
    },
    {
      label: 'Ngày 3',
      title: 'Tokyo - Yamanashi (Ăn Sáng, Trưa, Tối)',
      img: 'https://picsum.photos/158/100?random=3',
      detail: 'Hái trái cây: Tham quan nhà vườn, du khách được tự tay hái trái cây và thưởng thức tại vườn - Một trải nghiệm thật khó quên khi đến thăm Nhật Bản.\nGotemba Outlet: (nếu đủ thời gian) Mua sắm các mặt hàng thời trang cao cấp\nTrải nghiệm mặc đồ Yukata và tắm Onsen – liệu pháp trị liệu thư giãn bằng sưới nước khoán của người Nhật tại khách sạn.\nTối: Ăn tối & nghỉ đêm tại Yamanashi. Khách sạn 3-4*.'
    },
    {

      label: 'Ngày 4',
      title: 'Yamanashi - Nagoya (Ăn Sáng, Trưa, Tối)',
      img: 'https://picsum.photos/158/100?random=4',
      detail: 'Đảo San Hô (Coral) - Với bờ cát trắng và làn nước trong xanh ở vịnh Thái Lan, là điểm đến lý tưởng cho những ai yêu thích biển. Du khách có thể tắm biển hoặc thử các hoạt động giải trí như lặn biển, mô tô nước, và dù kéo (chi phí tự túc).'
    }
  ];

  toggle(index: number) {
    this.activeIndex = this.activeIndex === index ? null : index;
  }

  submitOrder(price: number, tourId: number,) {



    if (this.orderForm.valid) {
      const data = this.orderForm.value;
      console.log('🟢 Dữ liệu gửi yêu cầu:', data);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      // TODO: Gửi về server hoặc gọi service ở đây
      this.orderService.post(new Order(
        0,
        data.name,
        data.email,
        data.phone,
        data.note,
        '',
        price,
        this.selectedDate,
        new Tour(tourId),
        new Date(),
        this.adultCount,
      )).subscribe(data => {
        this.toastr.success('🎉 Đặt tour thành công!', 'Hệ thống');
        if (this.orderModalRef) {
          this.orderModalRef.close();
        }
      }, error => {
        console.log(error);
        this.toastr.error('Đặt đơn thất bại', 'Hệ thống');
        return;
      });



      // Đóng modal

    } else {
      this.toastr.error('Tour du lịch không tồn tại!', 'Hệ thống');
    }
  }

  showModalById(id: string) {
    const modalElement = document.getElementById(id);
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  getEndDate(tour: Tour): Date {
    if (!tour?.startDate) return new Date(); // phòng trường hợp null
    const start = new Date(tour.startDate);
    start.setDate(start.getDate() + 3); // cộng 3 ngày
    return start;
  }


  openOrderModal() {
    this.orderModalRef = this.modalService.open(this.orderModal, { centered: true, size: 'lg' });
  }
}