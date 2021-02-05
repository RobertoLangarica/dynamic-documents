<template>
  <q-dialog ref="dialog" @before-show="onBeforeOpen" @show="onOpen" @before-hide="onBeforeClose">
    <q-card ref="main_card">
      <q-card-section>
        <h5 class="q-my-none">Elige el tipo de campo</h5>
      </q-card-section>
      <q-card-section>
        <!-- <q-scroll-area class="dialog-scroll-list"> -->
        <q-list separator>
          <div v-for="category in fieldTypesCategories" :key="category">
            <q-item-label header>{{ category }}</q-item-label>
            <q-item
              clickable
              v-ripple
              v-for="(type, index) in $store.getters.fieldsTypesByCategory(category)"
              :key="index"
              @click="onTypeSelect(type)"
            >
              <q-item-section top avatar>
                <q-avatar color="white" text-color="primary" :icon="fieldTypeIcon(type.component)" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ type.name }}</q-item-label>
                <q-item-label caption lines="2">{{ type.description }}.</q-item-label>
              </q-item-section>
            </q-item>
          </div>
        </q-list>
        <!-- </q-scroll-area> -->
      </q-card-section>
      <q-card-actions align="center">
        <q-btn flat rounded color="secondary" label="Cancelar" @click="onCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { DDFieldType } from "../dynamic-documents/src/core/DDFieldType";
import { QDialog } from "quasar";

@Component({})
export default class FieldTypeDialog extends Vue {
  show () {
    (this.$refs.dialog as QDialog).show();
  }

  hide () {
    (this.$refs.dialog as QDialog).hide();
  }

  onTypeSelect (type: DDFieldType) {
    this.$emit("ok", type);
    this.hide();
  }

  onCancel () {
    this.hide();
  }

  onOpen () {
    console.log(this.$refs.dialog.$el)
    this.$refs.dialog.$el.scrollIntoView()
  }

  onBeforeOpen () {
    this.$root.$emit('opening_dialog')
  }

  onBeforeClose () {
    this.$root.$emit('closing_dialog')
  }

  get fieldTypesCategories () {
    return this.$store.getters.fieldTypesCategories
  }

  fieldTypeIcon (component) {
    switch (component) {
      case 'input-paragraph':
        return 'format_align_justify'
      case 'group':
        return 'select_all'
      default:
        return 'keyboard'
    }
  }
}
</script>

<style lang="scss">
.dialog-scroll-list {
  width: 50vw;
  min-width: 240px;
  max-width: 540px;
  height: 70vh;
}
</style>
