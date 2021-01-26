<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <div class="column full-height full-width" style="backgroundColor:white;">
      <span class="text-h6 col-auto" style="backgroundColor:green;">{{ title }}</span>

      <div class="col-6 bg-blue-4 column">
        <q-scroll-area class="bg-orange-2 col">
          <!-- <q-list>
            <q-item v-for="item in transformations" tag="label" v-ripple :key="item.id">
              <q-item-section side>
                <q-checkbox v-model="item.selected" @input="value=>{onChange(value,item)}" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ item.name }}</q-item-label>
                <q-item-label caption lines="2">{{ item.description }}.</q-item-label>
              </q-item-section>
            </q-item>
          </q-list> -->
          <q-option-group
            :options="transformations"
            v-model="selectedTransformations"
          />
        </q-scroll-area>
      </div>

      <div class="col bg-pink-6 column">
        <span class="text-h7 col-auto">Seleccionadas</span>
        <q-scroll-area class="bg-orange-2 col bg-grey" horizontal>
          <!-- <div > -->
          <draggable class="row no-wrap q-gutter-x-md" v-model="selectedTransformations" handle=".cursor-drag" :animation="200">
            <q-badge v-for="item in selectedTransformations" :key="item.id">
              <q-btn icon="drag_indicator" flat round size="sm" dense class="cursor-drag" color="grey" />
              <span class="q-mr-sm">{{ item.name }}</span>
            </q-badge>
          </draggable>
          <!-- </div> -->
        </q-scroll-area>
        <div class="col" />
      </div>

      <q-card-actions align="right" class="col-auto bg-orange-1">
        <q-btn flat rounded color="secondary" label="Cancelar" @click="onCancel" />
        <q-btn rounded color="primary" label="Agregar" @click="onOk" />
      </q-card-actions>
    </div>
  </q-dialog>
</template>

<script lang="ts">
import draggable from "vuedraggable";
import { Vue, Component, Prop } from 'vue-property-decorator'
import { QDialog } from "quasar";

@Component({ components: { draggable } })
export default class TransformationsDialog extends Vue {
    @Prop({ required: false, default: 'Transformaciones' }) readonly title!: string;

    selectedTransformations:any[] = []

    beforeMount () {
      void this.$store.dispatch("getTransformations");
    }

    get transformations () {
      return this.$store.state.dd.transformations
    }

    onChange (selected, item) {
      if (selected) {
        this.selectedTransformations.push(item)
      } else {
        let i = this.selectedTransformations.findIndex(i => i.id === item.id)
        if (i >= 0) {
          this.selectedTransformations.splice(i, 1)
        }
      }
    }

    show () {
      (this.$refs.dialog as QDialog).show();
    }

    hide () {
      (this.$refs.dialog as QDialog).hide();
    }

    onDialogHide () {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit("hide");
    }

    onOk () {
      this.$emit("ok");
      this.hide();
    }

    onCancel () {
      this.hide();
    }
}
</script>
