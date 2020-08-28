<template>
  <q-dialog ref="dialog">
    <q-card>
      <q-card-section>
        <q-scroll-area class="dialog-scroll-list">
          <q-list bordered separator>
            <q-item-label header>Textos</q-item-label>
            <q-item
              clickable
              v-ripple
              v-for="(type, index) in $store.state.dd.types"
              :key="index"
              @click="onTypeSelect(type)"
            >
              <q-item-section top avatar>
                <q-avatar color="white" text-color="primary" icon="bluetooth" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ type.name }}</q-item-label>
                <q-item-label caption lines="2">{{ type.description }}.</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
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
  show() {
    (this.$refs.dialog as QDialog).show();
  }

  hide() {
    (this.$refs.dialog as QDialog).hide();
  }

  onTypeSelect(type: DDFieldType) {
    this.$emit("ok", type);
    this.hide();
  }

  onCancel() {
    this.hide();
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
