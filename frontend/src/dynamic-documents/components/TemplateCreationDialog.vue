<template>
  <q-card class="bg-teal text-white" style="width: 60%">
    <q-card-section>
      <div class="text-h4">
        {{ title }}
      </div>
    </q-card-section>

    <q-card-section>
      <div class="text-h6">
        Nombre:
      </div>
      <nq-input class="q-ml-md" v-model="name" />
      <div class="text-h6 q-pt-lg ">
        Descripción:
      </div>
      <nq-input class="q-ml-md" v-model="description" autogrow />
    </q-card-section>

    <q-card-actions align="right" class="bg-white text-teal">
      <q-btn flat label="Cancelar" v-close-popup />
      <q-btn label="Ok" @click="onSave" v-close-popup color="teal" :disable="!couldSave" />
    </q-card-actions>
  </q-card>
</template>

<script>
export default {
  name: 'TemplateCreationDialog',
  props: {
    isTemplate: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      name: '',
      description: '',
      saved: false
    }
  },
  computed: {
    title () {
      return this.isTemplate ? 'Nueva Plantilla' : 'Nuevo Documento'
    },
    toSave () {
      return { name: this.name, description: this.description }
    },
    couldSave () {
      return this.name !== '' && this.description !== ''
    }
  },
  methods: {
    async onSave () {
      await this.$store.dispatch(this.isTemplate ? 'addTemplate' : 'addDocument', this.toSave)
    }
  }
}
</script>
