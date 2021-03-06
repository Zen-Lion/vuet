const name = 'route'

export default {
  name,
  mixin (path) {
    function set (obj, key, value) {
      Object.defineProperty(obj, key, {
        value,
        enumerable: false,
        writable: true,
        configurable: false
      })
    }
    function getOpt () {
      return this.$vuet._options.modules[path]
    }

    function getWatchs (obj, list) {
      if (typeof list === 'string') {
        list = [list]
      }
      const getObjVal = (obj, str) => {
        const arr = str.split('.')
        arr.forEach(k => {
          obj = obj[k]
        })
        return obj
      }
      const arr = []
      list.forEach(val => {
        let value = getObjVal(obj, val)
        if (!isNaN(value)) {
          value = String(value)
        }
        arr.push(JSON.stringify(value))
      })
      return arr
    }

    function diffWatch (to, from) {
      for (let i = 0; i < to.length; i++) {
        if (to[i] !== from[i]) {
          return true
        }
      }
      return false
    }
    return {
      beforeCreate () {
        if (!this.$vuet.__route__) {
          set(this.$vuet, '__route__', {})
        }
        const { watch = 'fullPath' } = getOpt.call(this)
        const toWatch = getWatchs(this.$route, watch)
        if (!this.$vuet.__route__[path]) {
          this.$vuet.__route__[path] = toWatch
        }
        if (diffWatch(toWatch, this.$vuet.__route__[path])) {
          this.$vuet.reset(path)
          this.$vuet.__route__[path] = toWatch
        }
        this.$vuet.fetch(path, { current: this }).then(() => {
          this.$vuet.__route__[path] = toWatch
        })
      },
      watch: {
        $route: {
          deep: true,
          handler (to, from) {
            const { watch = 'fullPath' } = getOpt.call(this)
            const toWatch = getWatchs(to, watch)
            const fromWatch = getWatchs(from, watch)
            if (!diffWatch(toWatch, fromWatch)) return false
            this.$vuet.fetch(path, this).then(() => {
              this.$vuet.__route__[path] = toWatch
            })
          }
        }
      }
    }
  }
}
