/*
 * @Author: ikouane
 * @Date: 2022-09-05 09:51:55
 * @LastEditTime: 2022-11-15 16:24:57
 * @LastEditors: ikouane
 * @Description:
 * @version:
 */
const app = new Vue({
  el: ".container",
  data() {
    return {
      canvas: {
        el: null,
        width: undefined,
        height: undefined,
      },
      ctx: null,
      config: {
        background: {
          color: "rgba(0, 0, 0, 0.4)",
          base64Image: null,
          paddingTop: 5,
          paddingRight: 5,
          paddingBottom: 5,
          paddingLeft: 5,
          borderSize: 0,
          borderColor: "rgba(0,0,0,0)",
          borderRadius: 0,
        },
        text: {
          fontSize: 14,
          fontFamily: "serif",
          color: "#FFFFFF",
          textAlign: "center",
        },
        export: {
          // 导入带有配置信息的文本后，是否继续使用该配置文件；如果不使用，则恢复原配置文件；如果使用，则继续使用该配置文件
          holdConfigBeforeNextImport: false,
          // 每秒执行多少次导出任务
          interVal: 100,
          // 文件名规则
          filenameRule: {
            // 前缀
            prefix: "pl",
            // 后缀
            suffix: null,
            // 序号起始
            startIndex: 0,
            // 分隔符
            separator: "_"
          }
        }
      },
      text: "【测试文字】",
      textsIndex: 0,
      textsDataRaw: "",
      textsData: [
        "文字1",
        {
          config: {
            background: {
              color: "yellow",
            },
            text: {
              fontSize: 30,
              fontFamily: "serif",
              color: "#000000",
            },
          },
          text: "文字2",
        },
        {
          config: {
            background: {
              color: "red",
            },
            text: {
              fontSize: 14,
              fontFamily: "serif",
              color: "#000000",
            },
          },
          text: "文字3",
        },
        "文字4",
      ],
      scale: 1,
      options: [
        {
          value: "serif",
          label: "默认",
        },
        {
          value: "Microsoft YaHei",
          label: "微软雅黑",
        },
        {
          value: "STHeiti",
          label: "华文黑体",
        },
        {
          value: "SimHei",
          label: "黑体",
        },
        {
          value: "Source Han Sans",
          label: "思源黑体",
        },
      ],
    };
  },
  methods: {
    init: function () {
      console.log("mounted -> init");
      this.canvas.el = this.$refs.canvas;
      this.canvas.width = this.canvas.el.width;
      this.canvas.height = this.canvas.el.height;
      this.ctx = this.canvas.el.getContext("2d");

      const myFont = new FontFace("myFont", "url(./custom.ttf)");
    },

    // 清除画布
    clearCanvas: function () {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    // 选择图片
    setBackgroundImage() {
      this.$refs["fileUploadInput"].click();
    },

    /**
     * 获取文件的Base64
     * @param file      {File}      文件
     * @param callback  {Function}  回调函数，参数为获取到的base64
     */
    fileToBase64(file) {
      return new Promise((resolve) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = function () {
          resolve(this.result);
        };
      });
    },

    // 监听图片改变
    handleFileChange() {
      console.log(this.$refs["fileUploadInput"].files);
      for (const file of this.$refs["fileUploadInput"].files) {
        this.fileToBase64(file).then((res) => {
          this.config.background.base64Image = res;
        });
      }
    },

    // 转化背景配置
    generateBackgroundConfig: function ({ config = null, text = "" }) {
      return new Promise((resolve) => {
        this.ctx.font = `${config?.text.fontSize || this.config.text.fontSize
          }px ${config?.text.fontFamily || this.config.text.fontFamily || "serif"
          }`;
        let width =
          this.ctx.measureText(text || this.text).width +
          (config?.background.paddingLeft ||
            this.config.background.paddingLeft) +
          (config?.background.paddingRight ||
            this.config.background.paddingRight);
        let height =
          Math.floor(config?.text.fontSize || this.config.text.fontSize) +
          (config?.background.paddingTop || this.config.background.paddingTop) +
          (config?.background.paddingBottom ||
            this.config.background.paddingBottom);
        this.canvas.width = width;
        this.canvas.height = height;
        console.log("调整画布大小");
        this.$nextTick(() => {
          if (this.config.background.base64Image) {
            let img = new Image();
            img.onload = () => {
              this.ctx.drawImage(
                img,
                0,
                0,
                this.canvas.width,
                this.canvas.height
              );

              this.ctx.fillStyle = `${config?.background.color ||
                this.config.background.color ||
                "transparent"
                }`;
              resolve(this.ctx);
            };
            img.src = this.config.background.base64Image;
          } else {
            this.ctx.fillStyle = `${config?.background.color ||
              this.config.background.color ||
              "transparent"
              }`;
            resolve(this.ctx);
          }
        });
      });
    },

    // TODO: 绘制多行文本
    // 转化文字配置
    generateTextConfig: function ({ config }) {
      return new Promise((resolve) => {
        this.ctx.font = `${config?.text.fontSize || this.config.text.fontSize
          }px ${config?.text.fontFamily || this.config.text.fontFamily || "serif"
          }`;
        this.ctx.fillStyle = `${config?.text.color || this.config.text.color}`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        resolve(this.ctx);
      });
    },

    // 绘制矩形背景
    drawBackground: function ({ config, text }) {
      return new Promise(async (resolve) => {
        let newCtx = await this.generateBackgroundConfig({ config, text });
        console.log("绘制背景");
        if (!this.config.background.borderSize)
          newCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        resolve(newCtx);
      });
    },

    drawText: function ({ config, text }) {
      return new Promise(async (resolve) => {
        let newCtx = await this.generateTextConfig({ config });
        console.log("绘制文本");
        newCtx.fillText(
          text || this.text,
          this.canvas.width / 2,
          this.canvas.height / 2
        );
        resolve(newCtx);
      });
    },

    generateCanvas: function (tempConfig = {}) {
      return new Promise(async (resolve) => {
        this.clearCanvas();
        await this.drawBackground(tempConfig);
        if (this.config.background.borderSize)
          this.fillRoundRect(
            this.ctx,
            0,
            0,
            this.canvas.width,
            this.canvas.height,
            this.config.background.borderSize,
            this.config.background.borderRadius,
            this.config.background.color,
            this.config.background.borderColor
          );
        await this.drawText(tempConfig);
        resolve("done");
      });
    },

    fillRoundRect(
      cxt,
      x,
      y,
      width,
      height,
      weight,
      radius,
      fillColor,
      borderColor
    ) {
      //圆的直径必然要小于矩形的宽高
      if (2 * radius > width || 2 * radius > height) {
        return false;
      }

      cxt.save();
      cxt.translate(x, y);
      //绘制圆角矩形的各个边
      this.drawRoundRectPath(cxt, width, height, weight, radius, borderColor);
      cxt.fillStyle = fillColor || "#fff"; //若是给定了值就用给定的值否则给予默认值
      cxt.fill();
      cxt.restore();
    },

    drawRoundRectPath(cxt, width, height, weight, radius, borderColor) {
      cxt.beginPath(0);
      //从右下角顺时针绘制，弧度从0到1/2PI
      cxt.arc(width - radius, height - radius, radius, 0, Math.PI / 2);
      //矩形下边线
      cxt.lineTo(radius, height);
      //左下角圆弧，弧度从1/2PI到PI
      cxt.arc(radius, height - radius, radius, Math.PI / 2, Math.PI);
      //矩形左边线
      cxt.lineTo(0, radius);
      //左上角圆弧，弧度从PI到3/2PI
      cxt.arc(radius, radius, radius, Math.PI, (Math.PI * 3) / 2);
      //上边线
      cxt.lineTo(width - radius, 0);
      //右上角圆弧
      cxt.arc(width - radius, radius, radius, (Math.PI * 3) / 2, Math.PI * 2);
      //右边线
      cxt.lineTo(width, height - radius);
      console.log(borderColor);

      cxt.strokeStyle = borderColor || "#fff";
      cxt.lineWidth = weight;
      cxt.stroke();
      cxt.closePath();
    },

    uuid() {
      let s = [];
      let hexDigits = "0123456789abcdef";
      for (let i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
      }
      s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
      s[8] = s[13] = s[18] = s[23] = "-";

      let uuid = s.join("");
      return uuid;
    },

    download: function (index) {
      let image = this.canvas.el.toDataURL("image/png");
      let link = document.createElement("a");
      link.download = this.generateFilename(index);
      link.href = image;
      link.click();
    },

    // 生成文件名;获取最新文件名;获取实例文件名
    generateFilename: function (index = this.textsIndex - 1, prefix = this.config.export.filenameRule.prefix, suffix = this.config.export.filenameRule.suffix, separator = this.config.export.filenameRule.separator) {
      if (index == "start") {
        index = this.config.export.filenameRule.startIndex;
      }
      else if (this.config.export.filenameRule.startIndex) {
        index = this.config.export.filenameRule.startIndex + index;
      }
      let filenameArray = [prefix, typeof index === "number" ? index : this.uuid(), suffix];
      for (let index = 0; index < filenameArray.length; index++) {
        if (filenameArray[index] === "") filenameArray.splice(index, 1);
      }
      return `${filenameArray.join(separator)}.png`
    },

    // 从配置文件中获取 text 内容
    getTextFromTexts: function (config) {
      try {
        if (typeof config === "string") {
          return config;
        }
        return config.text;
      } catch (error) {
        return false;
      }
    },

    // 批量生成
    autoGenerate: async function (e, config = null) {
      // 读取配置文件
      if (this.getTextFromTexts(this.textsData[this.textsIndex])) {
        if (config) {
          await this.generateCanvas(config);
        } else {
          if (
            this.textsData[this.textsIndex] ==
            this.getTextFromTexts(this.textsData[this.textsIndex])
          )
            await this.generateCanvas({
              config: null,
              text: this.textsData[this.textsIndex],
            });
          else await this.generateCanvas(this.textsData[this.textsIndex]);
        }
        this.download(this.textsIndex);
        this.textsIndex++;
        setTimeout(() => {
          this.autoGenerate();
        }, 1000 / this.config.export.interVal);
      } else
        this.$message({
          message: "导出完成",
          type: "success",
        });
    },

    // 获取实际渲染精度
    getRenderScale: function (val) {
      return this.scale * val;
    },
  },
  mounted() {
    this.init();

    this.config = window.VueUse.useStorage(
      "canvas-image-generate-config",
      this.config
    );
  },

  watch: {
    config: {
      handler(newVal, oldVal) {
        // console.log(newVal, oldVal);
        if (Object.is(newVal.export, oldVal.export)) {
          // console.log("export change, do not need generate canvas")
        } else
          this.generateCanvas();
      },
      deep: true,
    },
    text: function () {
      this.generateCanvas();
    },
    textsDataRaw: function (newVal) {
      this.textsIndex = 0;
      this.textsData = newVal.split("\n");
    },
  },
});
