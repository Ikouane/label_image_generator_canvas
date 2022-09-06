/*
 * @Author: ikouane
 * @Date: 2022-09-05 09:51:55
 * @LastEditTime: 2022-09-06 17:50:43
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
        // 导入带有配置信息的文本后，是否继续使用该配置文件；如果不使用，则恢复原配置文件；如果使用，则继续使用该配置文件
        holdConfigBeforeNextImport: false,
        // 每秒执行多少次导出任务
        interVal: 100,
        background: {
          color: "#FFFFFF",
        },
        text: {
          fontSize: 14,
          fontFamily: "serif",
          color: "#000000",
        },
      },
      text: "",
      textsIndex: 0,
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

    // 转化背景配置
    generateBackgroundConfig: function ({ config = null, text = "" }) {
      return new Promise((resolve) => {
        this.ctx.font = `${
          config?.text.fontSize || this.config.text.fontSize
        }px ${
          config?.text.fontFamily || this.config.text.fontFamily || "serif"
        }`;
        let width = this.ctx.measureText(text || this.text).width + 20;
        let height =
          Math.floor(config?.text.fontSize || this.config.text.fontSize) * 1.25;
        this.canvas.width = width;
        this.canvas.height = height;
        console.log("调整画布大小");
        this.$nextTick(() => {
          this.ctx.fillStyle = `${
            config?.background.color ||
            this.config.background.color ||
            "transparent"
          }`;
          resolve(this.ctx);
        });
      });
    },

    // 转化文字配置
    generateTextConfig: function ({ config }) {
      return new Promise((resolve) => {
        this.ctx.font = `${
          config?.text.fontSize || this.config.text.fontSize
        }px ${
          config?.text.fontFamily || this.config.text.fontFamily || "serif"
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
        await this.drawText(tempConfig);
        resolve("done");
      });
    },

    download: function (index) {
      let image = this.canvas.el.toDataURL("image/png");
      let link = document.createElement("a");
      link.download = `pl_${index}.png`;
      link.href = image;
      link.click();
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
        }, 1000 / this.config.interVal);
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
  },

  watch: {
    config: {
      handler(newVal, oldVal) {
        console.log(newVal, oldVal);
        this.generateCanvas();
      },
      deep: true,
    },
    text: function () {
      this.generateCanvas();
    },
  },
});
