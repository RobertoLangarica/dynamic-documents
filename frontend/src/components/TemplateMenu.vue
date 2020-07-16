<template>
    <div class="row">
        <h6 class="q-mb-none">{{title}}</h6>
        <div v-for="item in objects" :key="item.id" class="row col-12">
            <q-btn class="col-12" :label="item.name" @click="$emit('select',item.id)" color="primary" flat/>
        </div>
    </div>
</template>

<script>
export default {
  props: {
    objects: {
      required: false,
      type: Array,
      default: () => []
    },
    title: {
      required: false,
      type: String,
      default: 'Título'
    }
  },
  data () {
    return {}
  }
}
</script>
