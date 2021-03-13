<template>
    <q-list separator>
      <div v-for="category in fieldCategories" :key="category">
        <q-item-label header>{{ category }}</q-item-label>
        <q-item
          clickable
          v-ripple
          v-for="(type, index) in typesByCategory(category)"
          :key="index"
          @click="onTypeSelected(type)"
        >
          <q-item-section top avatar>
            <q-avatar color="white" text-color="primary" :icon="typeIcon(type.component)" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ type.name }}</q-item-label>
            <q-item-label caption lines="2">{{ type.description }}.</q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </q-list>
</template>

<script lang="ts">
import Component, { mixins } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import EmbedMixin from "src/pages/embeds/EmbedMixin";
import { DDFieldType } from "src/dynamic-documents/src/core/DDFieldType";

@Component({})
export default class FieldTypeSelection extends mixins(EmbedMixin) {
   @Prop({type: Array, required: false, default:()=>[]}) categories!:string[]
   @Prop({type: Array, required: false, default:()=>[]}) types!:DDFieldType[]

  fieldCategories:string[] = []
  fieldtypes:DDFieldType[] = []

  created(){
    this.fieldCategories = this.categories
    this.fieldtypes = this.types
  }

  async onMessage (message, data, handled = false) {
      switch (message) {
        case 'set_data':
          handled = true
          this.fieldCategories = data.categories
          this.fieldtypes = data.types
          break;
        default:
          if (!handled) {
            console.log(`Unrecognized event->${message}`)
          }
      }
    }

  get embedded(){
    return this.invisibleDialogs
  }

  onTypeSelected (type: DDFieldType) {
    if(this.embedded){
      this.sendMessage("selected", type);
    } else {
      this.$emit("selected", type);
    }
  }

  typesByCategory (category) {
    return this.fieldtypes.filter((fieldType) => fieldType.category === category)
  }

  typeIcon (component) {
    switch (component) {
      case 'input-paragraph':
        return 'format_align_justify'
      case 'date-time':
        return 'event'
      case 'input-currency':
        return 'paid'
      case 'input-number':
        return 'calculate'
      case 'input-integer':
        return 'looks_6'
      case 'input-percentage':
        return 'timelapse'
      case 'input-text':
        return 'text_fields'
      case 'group':
        return 'category'
      default:
        return 'keyboard'
    }
  }
}
</script>

<style lang="scss" scoped>
.scroll-list {
 overflow-x: hidden;
 overflow-y: auto;
}
</style>