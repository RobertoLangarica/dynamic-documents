<template>
    <div class="row">
        <div class="col-12 row justify-between items-center">
          <h6>{{title}}</h6>
          <div><q-btn round icon="add_circle" flat @click="$emit('add')"/></div>
        </div>
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
