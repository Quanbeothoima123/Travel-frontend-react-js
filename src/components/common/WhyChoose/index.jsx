import React from "react";
import "./WhyChoose.css";

const WhyChoose = () => {
  return (
    <div className="why-choose">
      <h2>TẠI SAO BẠN CHỌN CHÚNG TÔI</h2>
      <div className="features">
        <div className="feature-card">
          <img
            src="https://www.vietnamtravelgroup.com.vn/datafiles/32985/upload/images/banner/price.png"
            alt="Giá tốt"
          />
          <h3>GIÁ TỐT - NHẬU ỨU ĐÃI</h3>
          <p>Ưu đãi qua tặng hấp dẫn khi mua tour online</p>
        </div>
        <div className="feature-card">
          <img
            src="https://www.vietnamtravelgroup.com.vn/datafiles/32985/upload/images/banner/pay.png"
            alt="Thanh toán an toàn"
          />
          <h3>THANH TOÁN AN TOÀN</h3>
          <p>Được bảo mật tốt và chắc chắn nhé</p>
        </div>
        <div className="feature-card">
          <img
            src="https://www.vietnamtravelgroup.com.vn/datafiles/32985/upload/images/banner/promotion.png"
            alt="Tư vấn miễn phí"
          />
          <h3>TƯ VẤN MIỄN PHÍ</h3>
          <p>Hỗ trợ tư vấn offline/online miễn phí</p>
        </div>
        <div className="feature-card">
          <img
            src="https://www.vietnamtravelgroup.com.vn/datafiles/32985/upload/images/banner/star.png"
            alt="Thương hiệu uy tín"
          />
          <h3>THƯƠNG HIỆU UY TÍN</h3>
          <p>Thương hiệu lớn hàng hàng đầu Việt Nam</p>
        </div>
      </div>
    </div>
  );
};

export default WhyChoose;
