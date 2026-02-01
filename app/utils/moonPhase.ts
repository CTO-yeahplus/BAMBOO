// app/utils/moonPhase.ts

export const getMoonPhase = (date: Date) => {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
  
    if (month < 3) {
      year--;
      month += 12;
    }
  
    ++month;
    
    // 율리우스 일(Julian Day) 계산 근사식
    let c = 365.25 * year;
    let e = 30.6 * month;
    let jd = c + e + day - 694039.09; // 1900년 1월 1일 기준
    jd /= 29.5305882; // 달의 주기(Synodic Month)
    let b = parseInt(jd.toString()); // 정수 부분
    jd -= b; // 소수 부분 (0 ~ 1 사이의 값)
    
    // 0: New Moon, 0.5: Full Moon, 1: New Moon
    b = Math.round(jd * 8); 
    
    if (b >= 8) b = 0;
  
    // 0: New Moon (그믐)
    // 1: Waxing Crescent (초승)
    // 2: First Quarter (상현)
    // 3: Waxing Gibbous
    // 4: Full Moon (보름)
    // 5: Waning Gibbous
    // 6: Last Quarter (하현)
    // 7: Waning Crescent (그믐)
    return b;
  };
  
  export const getMoonIconPath = (phase: number) => {
      // SVG Paths for Moon Phases
      switch (phase) {
          case 0: return "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8 8z"; // New Moon (Outline)
          case 1: return "M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.85.63-3.55 1.69-4.9L12 2v18z"; // Crescent
          case 2: return "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18V2c4.41 0 8 3.59 8 8s-3.59 8-8 8z"; // Quarter
          case 3: return "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18V2c4.41 0 8 3.59 8 8s-3.59 8-8 8z"; // Gibbous (Simplified)
          case 4: return "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"; // Full Moon (Filled)
          default: return "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8 8z";
      }
  };