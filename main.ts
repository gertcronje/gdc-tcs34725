namespace gdcTCS34725 {

basic.forever(function () {
	
})

let TCS34725_ADDR = 0x29

enum TCS34752_reg {
    TCS34725_CMD_BIT        =  0x80,
    TCS34725_CMD_Read_Byte  =  0x00,
    TCS34725_CMD_Read_Word  =  0x20,
    TCS34725_CMD_Clear_INT  =  0x66,     // RGBC Interrupt flag clear
    
    TCS34725_ENABLE         =  0x00,     
    TCS34725_ENABLE_AIEN    =  0x10,     // RGBC Interrupt Enable 
    TCS34725_ENABLE_WEN     =  0x08,     // Wait enable - Writing 1 activates the wait timer 
    TCS34725_ENABLE_AEN     =  0x02,     // RGBC Enable - Writing 1 actives the ADC, 0 disables it 
    TCS34725_ENABLE_PON     =  0x01,     // Power on - Writing 1 activates the internal oscillator, 0 disables it 
    
    TCS34725_ATIME         =   0x01,     // Integration time 
    TCS34725_WTIME         =   0x03,     // Wait time (if TCS34725_ENABLE_WEN is asserted)
    TCS34725_WTIME_2_4MS   =   0xFF,     // WLONG0 = 2.4ms   WLONG1 = 0.029s
    TCS34725_WTIME_204MS   =   0xAB,     // WLONG0 = 204ms   WLONG1 = 2.45s 
    TCS34725_WTIME_614MS   =   0x00,     // WLONG0 = 614ms   WLONG1 = 7.4s  
    
    TCS34725_AILTL         =   0x04,     // Clear channel lower interrupt threshold
    TCS34725_AILTH         =   0x05,
    TCS34725_AIHTL         =   0x06,     // Clear channel upper interrupt threshold
    TCS34725_AIHTH         =   0x07,
    
    TCS34725_PERS          =   0x0C,     // Persistence register - basic SW filtering mechanism for interrupts */
    TCS34725_PERS_NONE     =   0x00,     // Every RGBC cycle generates an interrupt                                */
    TCS34725_PERS_1_CYCLE  =   0x01,     // 1 clean channel value outside threshold range generates an interrupt   */
    TCS34725_PERS_2_CYCLE  =   0x02,     // 2 clean channel values outside threshold range generates an interrupt  */
    TCS34725_PERS_3_CYCLE  =   0x03,     // 3 clean channel values outside threshold range generates an interrupt  */
    TCS34725_PERS_5_CYCLE  =   0x04,     // 5 clean channel values outside threshold range generates an interrupt  */
    TCS34725_PERS_10_CYCLE =   0x05,     // 10 clean channel values outside threshold range generates an interrupt */
    TCS34725_PERS_15_CYCLE =   0x06,     // 15 clean channel values outside threshold range generates an interrupt */
    TCS34725_PERS_20_CYCLE =   0x07,     // 20 clean channel values outside threshold range generates an interrupt */
    TCS34725_PERS_25_CYCLE =   0x08,     // 25 clean channel values outside threshold range generates an interrupt */
    TCS34725_PERS_30_CYCLE =   0x09,     // 30 clean channel values outside threshold range generates an interrupt */
    TCS34725_PERS_35_CYCLE =   0x0a,     // 35 clean channel values outside threshold range generates an interrupt */
    TCS34725_PERS_40_CYCLE =   0x0b,     // 40 clean channel values outside threshold range generates an interrupt */
    TCS34725_PERS_45_CYCLE =   0x0c,     // 45 clean channel values outside threshold range generates an interrupt */
    TCS34725_PERS_50_CYCLE =   0x0d,     // 50 clean channel values outside threshold range generates an interrupt */
    TCS34725_PERS_55_CYCLE =   0x0e,     // 55 clean channel values outside threshold range generates an interrupt */
    TCS34725_PERS_60_CYCLE =   0x0f,     // 60 clean channel values outside threshold range generates an interrupt */
    
    TCS34725_CONFIG         =  0x0D,
    TCS34725_CONFIG_WLONG   =  0x02,     // Choose between short and long (12x) wait times via TCS34725_WTIME */
    
    TCS34725_CONTROL       =   0x0F,     // Set the gain level for the sensor */
    TCS34725_ID            =   0x12,     // 0x44 = TCS34721/TCS34725, 0x4D = TCS34723/TCS34727 */
    
    TCS34725_STATUS        =   0x13,
    TCS34725_STATUS_AINT   =   0x10,     // RGBC Clean channel interrupt */
    TCS34725_STATUS_AVALID =   0x01,     // Indicates that the RGBC channels have completed an integration cycle */
    
    TCS34725_CDATAL        =   0x14,     // Clear channel data */
    TCS34725_CDATAH        =   0x15,
    TCS34725_RDATAL        =   0x16,     // Red channel data */
    TCS34725_RDATAH        =   0x17,
    TCS34725_GDATAL        =   0x18,     // Green channel data */
    TCS34725_GDATAH        =   0x19,
    TCS34725_BDATAL        =   0x1A,     // Blue channel data */
    TCS34725_BDATAH        =   0x1B
}

/**
* Integration Time
**/
enum TCS34725IntegrationTime {
    TCS34725_INTEGRATIONTIME_2_4MS = 0xFF,   /**<  2.4ms - 1 cycle    - Max Count: 1024  */
    TCS34725_INTEGRATIONTIME_24MS = 0xF6,   /**<  24ms  - 10 cycles  - Max Count: 10240 */
    TCS34725_INTEGRATIONTIME_50MS = 0xEB,   /**<  50ms  - 20 cycles  - Max Count: 20480 */
    TCS34725_INTEGRATIONTIME_101MS = 0xD5,   /**<  101ms - 42 cycles  - Max Count: 43008 */
    TCS34725_INTEGRATIONTIME_154MS = 0xC0,   /**<  154ms - 64 cycles  - Max Count: 65535 */
    TCS34725_INTEGRATIONTIME_700MS = 0x00    /**<  700ms - 256 cycles - Max Count: 65535 */
}

let IntegrationTime = 0

/**
* Gain
**/
enum TCS34725Gain {
        TCS34725_GAIN_1X = 0x00,   /**<  No gain  */
        TCS34725_GAIN_4X = 0x01,   /**<  4x gain  */
        TCS34725_GAIN_16X = 0x02,   /**<  16x gain */
        TCS34725_GAIN_60X = 0x03    /**<  60x gain */
}

let Gain = 0
    
let tcs34725RGB = {
        red: 0,
        green: 0,
        blue: 0
};

/**
 * set TCS34725 reg
 */
function setReg(reg: number, dat: number): void {
    let buf = pins.createBuffer(2);
    buf[0] = reg | TCS34752_reg.TCS34725_CMD_BIT;
    buf[1] = dat;
    pins.i2cWriteBuffer(TCS34725_ADDR, buf);
}

/**
 * get ds1307's reg
 */
function getReg(reg: number): number {
    pins.i2cWriteNumber(TCS34725_ADDR, reg | TCS34752_reg.TCS34725_CMD_BIT, NumberFormat.UInt8BE);
    return pins.i2cReadNumber(TCS34725_ADDR, NumberFormat.UInt8BE);
}

/**
  * get ds1307's reg Word
  */
function getWord(reg: number): number {
    let buf = pins.createBuffer(2);
    let val = 0;

    pins.i2cWriteNumber(TCS34725_ADDR, reg | TCS34752_reg.TCS34725_CMD_BIT, NumberFormat.UInt8BE);
    buf = pins.i2cReadBuffer(TCS34725_ADDR, 2)
    val = buf[1]<<8 | buf[0];
    return val
}

//% block="tcs34725 enable"
export function tcs34725_enable() {
    setReg(TCS34752_reg.TCS34725_ENABLE, TCS34752_reg.TCS34725_ENABLE_PON);
    control.waitMicros(3000)
    setReg(TCS34752_reg.TCS34725_ENABLE, TCS34752_reg.TCS34725_ENABLE_PON | TCS34752_reg.TCS34725_ENABLE_AEN);
    control.waitMicros(3000)
}

//% block="tcs34725 disable"
export function tcs34725_disable() {
    /* Turn the device off to save power */
    let reg = 0
    reg = getReg(TCS34752_reg.TCS34725_ENABLE);
    setReg(TCS34752_reg.TCS34725_ENABLE, reg & ~(TCS34752_reg.TCS34725_ENABLE_PON | TCS34752_reg.TCS34725_ENABLE_AEN));
}

//% block="tcs34725 set integration time $value"
export function tcs34725_set_integration_time(time: TCS34725IntegrationTime)
{
    /* Update the timing register */
    setReg(TCS34752_reg.TCS34725_ATIME, time);
    IntegrationTime = time;
}

//% block="tcs34725 set gain $value"
export function tcs34725_set_gain(gain: TCS34725Gain)
{
    setReg(TCS34752_reg.TCS34725_CONTROL, gain);
    Gain = gain;
}


//% block="tcs34725 get RGB data"
export function tcs34725_get_rgb_data()
{
    let rgb = tcs34725RGB
    let C = getWord(TCS34752_reg.TCS34725_CDATAL);
    let R = getWord(TCS34752_reg.TCS34725_RDATAL);
    let G = getWord(TCS34752_reg.TCS34725_GDATAL);
    let B = getWord(TCS34752_reg.TCS34725_BDATAL);

    if(C == 0) {
        rgb.red = 0;
        rgb.green = 0;
        rgb.blue = 0;
    }
    else {
        rgb.red = R;
        rgb.green = G;
        rgb.blue = B;
    }
    return rgb;
}

//% block="tcs34725_get_rgb888"
export function TCS34725_GetRGB888() {
    let i = 1.0;
    let rgb = tcs34725_get_rgb_data();

    // Limit data range
    if (rgb.red >= rgb.green && rgb.red >= rgb.blue) {
        i = rgb.red / 255.0 + 1;
    }
    else if (rgb.green >= rgb.red && rgb.green >= rgb.blue) {
        i = rgb.green / 255.0 + 1;
    }
    else if (rgb.blue >= rgb.green && rgb.blue >= rgb.red) {
        i = rgb.blue / 255.0 + 1;
    }
    if (i != 0) {
        rgb.red = (rgb.red) / i;
        rgb.green = (rgb.green) / i;
        rgb.blue = (rgb.blue) / i;
    }
    //Amplify data differences
    /*Please don't try to make the data negative, 
        unless you don't change the data type*/
    if (rgb.red > 30)
        rgb.red = rgb.red - 30;
    if (rgb.green > 30)
        rgb.green = rgb.green - 30;
    if (rgb.blue > 30)
        rgb.blue = rgb.blue - 30;
    rgb.red = rgb.red * 255 / 225;
    rgb.green = rgb.green * 255 / 225;
    rgb.blue = rgb.blue * 255 / 225;
    if (rgb.red > 255)
        rgb.red = 255;
    if (rgb.green > 255)
        rgb.green = 255;
    if (rgb.blue > 255)
        rgb.blue = 255;
    return rgb;
}

//% block="tcs34725 init"
export function tcs34725_init()
{
    let ID = 0;
    ID = getReg(TCS34752_reg.TCS34725_ID);
    if (ID != 0x44 && ID != 0x4D) {
        return 1;
    }

    //Set the integration time and gain
    tcs34725_set_integration_time(TCS34725IntegrationTime.TCS34725_INTEGRATIONTIME_154MS);
    tcs34725_set_gain(TCS34725Gain.TCS34725_GAIN_60X);
    tcs34725_enable();
    
    return 0;
}
}
